"""
商品 API 路由
游客可访问，无需鉴权（GET 请求）
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func, distinct
from typing import Optional, List
from decimal import Decimal
from app.database import get_db, get_table
from app.schemas.shop import WheelsListResponse, WheelProductResponse, WheelSpecResponse, BrandsListResponse, BrandResponse
from app.core.public_cache_client import public_cache_client
import json

router = APIRouter()


def parse_pcd(pcd_str: Optional[str]) -> Optional[tuple]:
    """
    解析 PCD 字符串（如 "5x114.3"）为 (lugs, mm)
    
    Returns:
        (lugs: int, mm: float) 或 None
    """
    if not pcd_str:
        return None
    
    import re
    match = re.match(r'(\d+)x([\d.]+)', pcd_str.replace('×', 'x').replace('X', 'x'))
    if match:
        return (int(match.group(1)), float(match.group(2)))
    return None


def parse_diameter(diameter_str: Optional[str]) -> Optional[int]:
    """
    解析直径字符串（如 "18\""）为整数
    
    Returns:
        int 或 None
    """
    if not diameter_str:
        return None
    
    import re
    match = re.search(r'(\d+)', diameter_str)
    if match:
        return int(match.group(1))
    return None


@router.get("/wheels", response_model=WheelsListResponse, summary="获取轮毂商品列表")
async def get_wheels(
    vehicle_id: Optional[str] = Query(None, description="车辆ID（优先，用于匹配 fitment）"),
    profile_id: Optional[int] = Query(None, description="Wheel Profile ID（已废弃，保留兼容）"),
    engine_id: Optional[int] = Query(None, description="发动机ID（已废弃，保留兼容）"),
    pcd: Optional[str] = Query(None, description="PCD（如 5x114.3）"),
    diameter: Optional[int] = Query(None, description="轮毂直径（英寸，如 18）"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    获取轮毂商品列表
    
    支持筛选：
    - vehicle_id: 根据车辆ID匹配 fitment（推荐，从 mini_vehicle_detail 推导 pcd/diameter）
    - pcd: PCD 精确匹配
    - diameter: 直径匹配
    
    如果提供了 vehicle_id，会从 mini_vehicle_detail 获取 fitment 参数并自动匹配商品规格
    """
    products_table = get_table("mini_product")
    specs_table = get_table("mini_product_spec")
    detail_table = get_table("mini_vehicle_detail")
    
    # 如果提供了 vehicle_id，先获取 fitment 参数
    target_pcd = pcd
    target_diameter = diameter
    
    if vehicle_id:
        # 查询指定的 vehicle_detail
        detail_result = db.execute(
            select(detail_table)
            .where(detail_table.c.vehicle_id == vehicle_id)
            .limit(1)
        )
        detail_row = detail_result.fetchone()
        
        if detail_row:
            # 提取 PCD（优先用 front，如果没有则用 rear）
            if not target_pcd:
                target_pcd = detail_row.bolt_pattern_front or detail_row.bolt_pattern_rear
            
            # 提取直径（从 rim_diameter_front）
            if not target_diameter and detail_row.rim_diameter_front:
                target_diameter = parse_diameter(detail_row.rim_diameter_front)
    
    # 构建查询条件
    conditions = [
        products_table.c.status == "normal",  # 只查询正常状态的商品
    ]
    
    # 查询商品规格（用于筛选）
    spec_conditions = [
        specs_table.c.status == "normal",  # 只查询正常状态的规格
    ]
    
    # PCD 匹配（字符串匹配，支持多种格式）
    if target_pcd:
        # 标准化 PCD 格式（统一为 "5x114.3" 格式）
        normalized_pcd = target_pcd.replace('×', 'x').replace('X', 'x').strip()
        # 支持多种格式匹配（如 "5x114.3", "5×114.3", "5X114.3"）
        spec_conditions.append(
            or_(
                specs_table.c.pcd == normalized_pcd,
                specs_table.c.pcd == normalized_pcd.replace('x', '×'),
                specs_table.c.pcd == normalized_pcd.replace('x', 'X'),
                specs_table.c.pcd.like(f"%{normalized_pcd}%"),  # 模糊匹配
            )
        )
    
    # 直径匹配（从 diameter 字段提取数字）
    if target_diameter:
        # 匹配 diameter 字段中包含目标直径的规格（如 "18\"" 匹配 18）
        spec_conditions.append(
            specs_table.c.diameter.like(f"%{target_diameter}%")
        )
    
    # 查询符合条件的规格ID列表
    spec_ids_result = db.execute(
        select(distinct(specs_table.c.product_id))
        .where(and_(*spec_conditions))
    )
    spec_product_ids = [row[0] for row in spec_ids_result.fetchall()]
    
    if not spec_product_ids:
        # 没有匹配的规格，返回空列表
        return WheelsListResponse(
            items=[],
            total=0,
            page=page,
            page_size=page_size,
        )
    
    # 添加商品ID条件
    conditions.append(products_table.c.id.in_(spec_product_ids))
    
    # 查询商品总数
    count_result = db.execute(
        select(func.count(products_table.c.id))
        .where(and_(*conditions))
    )
    total = count_result.scalar() or 0
    
    # 查询商品列表（分页）
    offset = (page - 1) * page_size
    products_result = db.execute(
        select(products_table)
        .where(and_(*conditions))
        .order_by(products_table.c.weigh.desc(), products_table.c.createtime.desc())
        .limit(page_size)
        .offset(offset)
    )
    
    products = []
    for product_row in products_result.fetchall():
        # 查询该商品的所有规格
        specs_result = db.execute(
            select(specs_table)
            .where(
                and_(
                    specs_table.c.product_id == product_row.id,
                    specs_table.c.status == "normal"
                )
            )
            .order_by(specs_table.c.weigh.desc(), specs_table.c.createtime.desc())
        )
        
        specs = []
        for spec_row in specs_result.fetchall():
            # 检查规格是否匹配筛选条件
            spec_matches = True
            
            if target_pcd:
                normalized_pcd = target_pcd.replace('×', 'x').replace('X', 'x').strip()
                spec_pcd = spec_row.pcd or ""
                if normalized_pcd not in spec_pcd.replace('×', 'x').replace('X', 'x'):
                    spec_matches = False
            
            if target_diameter and spec_matches:
                spec_diameter = parse_diameter(spec_row.diameter)
                if spec_diameter != target_diameter:
                    spec_matches = False
            
            # 只包含匹配的规格
            if spec_matches:
                specs.append(WheelSpecResponse(
                    spec_id=spec_row.id,
                    size=spec_row.size,
                    diameter=spec_row.diameter,
                    width=spec_row.width,
                    pcd=spec_row.pcd,
                    offset=spec_row.offset,
                    center_bore=spec_row.center_bore,
                    price=spec_row.price,
                    stock=spec_row.stock or 0,
                ))
        
        # 如果商品有匹配的规格，才添加到结果中
        if specs:
            products.append(WheelProductResponse(
                product_id=product_row.id,
                name=product_row.name,
                brand_id=product_row.brand_id,
                brand_name=None,  # 可以后续 JOIN brand 表获取
                image=product_row.image,
                sale_price=product_row.sale_price,
                original_price=product_row.original_price,
                price_per=product_row.price_per,
                stock=product_row.stock or 0,
                status=product_row.status,
                specs=specs,
            ))
    
    return WheelsListResponse(
        items=products,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/brands", response_model=BrandsListResponse, summary="获取品牌列表（Featured Brands）")
async def get_brands(
    db: Session = Depends(get_db)
):
    """
    获取品牌列表（Featured Brands）
    
    - 游客可访问，无需鉴权
    - 只返回状态为 normal 的品牌
    - 按 weigh 降序排序（权重高的在前）
    - 使用 Redis 公共缓存（DB=1），TTL 1小时
    """
    # 1. 先尝试从缓存获取
    version = public_cache_client.get_version("brands")
    cache_key = f"publiccache:brands:v{version}:list"
    
    cached_data = public_cache_client.get(cache_key)
    if cached_data:
        try:
            cached_brands = json.loads(cached_data)
            return BrandsListResponse(**cached_brands)
        except Exception:
            # 缓存数据格式错误，继续查询数据库
            pass
    
    # 2. 缓存未命中，查询数据库
    brands_table = get_table("mini_wheel_brand")
    
    result = db.execute(
        select(brands_table)
        .where(brands_table.c.status == "normal")
        .order_by(brands_table.c.weigh.desc(), brands_table.c.createtime.desc())
    )
    brands_rows = result.fetchall()
    
    # 3. 转换为响应格式
    brands = []
    for brand_row in brands_rows:
        brand_dict = dict(brand_row._mapping)
        brands.append(BrandResponse(
            id=brand_dict["id"],
            name=brand_dict["name"],
            slug=brand_dict.get("slug"),
            logo=brand_dict.get("logo"),
            description=brand_dict.get("description"),
            status=brand_dict["status"],
            weigh=brand_dict.get("weigh", 0),
        ))
    
    # 4. 回填缓存
    response_data = BrandsListResponse(
        brands=brands,
        total=len(brands)
    )
    public_cache_client.set(
        cache_key,
        json.dumps(response_data.model_dump(), ensure_ascii=False),
        ttl=3600  # 1小时TTL
    )
    
    return response_data



