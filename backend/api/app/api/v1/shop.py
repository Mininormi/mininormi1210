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


def parse_bolt_pattern(bolt_pattern_str: Optional[str]) -> Optional[tuple]:
    """
    解析 Bolt Pattern 字符串（如 "5x120.65"）为 (lugs, mm)
    使用 Decimal 保证精度，避免浮点数误差
    
    Args:
        bolt_pattern_str: Bolt pattern 字符串，如 "5x120.65", "4x100", "6x139.7"
    
    Returns:
        (lugs: int, mm: Decimal) 或 None（如果解析失败）
    
    Examples:
        >>> parse_bolt_pattern("5x120.65")
        (5, Decimal('120.65'))
        >>> parse_bolt_pattern("4x100")
        (4, Decimal('100'))
        >>> parse_bolt_pattern("6x139.7")
        (6, Decimal('139.7'))
    """
    if not bolt_pattern_str:
        return None
    
    import re
    # 标准化：统一 ×/X -> x，去除空格，转小写
    normalized = bolt_pattern_str.replace('×', 'x').replace('X', 'x').strip().lower()
    
    # 匹配格式：数字x数字（支持小数）
    # 例如：5x120.65, 4x100, 6x139.7
    match = re.match(r'^(\d{1,2})x(\d{2,3}(?:\.\d{1,3})?)$', normalized)
    if match:
        lugs = int(match.group(1))
        mm_str = match.group(2)
        # 使用 Decimal 保证精度
        mm = Decimal(mm_str)
        return (lugs, mm)
    
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
                    original_price=getattr(spec_row, 'original_price', None),  # 兼容旧表结构
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


@router.get("/wheels/by-vehicle", response_model=WheelsListResponse, summary="根据车辆ID获取匹配的轮毂商品")
async def get_wheels_by_vehicle(
    vehicle_id: str = Query(..., description="车辆ID（vehicle_id）"),
    axle: str = Query("both", regex="^(front|rear|both)$", description="匹配轴：front=前轮, rear=后轮, both=前后轮都匹配"),
    diameter: Optional[int] = Query(None, ge=10, le=30, description="轮毂直径（英寸，可选过滤，如：18）"),
    brand_id: Optional[int] = Query(None, description="品牌ID（可选过滤）"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(20, ge=1, le=100, description="每页数量"),
    db: Session = Depends(get_db)
):
    """
    根据车辆ID获取匹配的轮毂商品（路线A：使用数值匹配 pcd_lugs + pcd_mm）
    
    流程：
    1. 从 mini_vehicle_detail 获取车辆的 bolt_pattern_front/rear
    2. 解析 bolt pattern 为 (lugs, mm) 数值
    3. 使用 pcd_lugs 和 pcd_mm 精确匹配 mini_wheel_product_spec
    4. 返回匹配的商品列表（包含规格）
    
    支持前后轴分别匹配或同时匹配
    """
    # #region agent log
    import json
    try:
        with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
            f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:338","message":"Function entry","data":{"vehicle_id":vehicle_id,"axle":axle,"diameter":diameter,"brand_id":brand_id,"page":page,"page_size":page_size},"timestamp":int(__import__('time').time()*1000)})+'\n')
    except: pass
    # #endregion
    
    try:
        # 1. 获取车辆适配参数
        vehicle_detail_table = get_table("mini_vehicle_detail")
        vehicle_result = db.execute(
            select(vehicle_detail_table)
            .where(vehicle_detail_table.c.vehicle_id == vehicle_id)
            .limit(1)
        )
        vehicle_row = vehicle_result.fetchone()
        
        # #region agent log
        try:
            with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"C","location":"shop.py:365","message":"Vehicle query result","data":{"vehicle_found":vehicle_row is not None,"front_pattern":vehicle_row.bolt_pattern_front if vehicle_row else None,"rear_pattern":vehicle_row.bolt_pattern_rear if vehicle_row else None},"timestamp":int(__import__('time').time()*1000)})+'\n')
        except: pass
        # #endregion
        
        if not vehicle_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"未找到车辆ID: {vehicle_id}"
            )
        
        # 2. 解析前后轴的 bolt pattern
        bolt_patterns_to_match = []
        
        if axle in ("front", "both"):
            front_pattern = vehicle_row.bolt_pattern_front
            if front_pattern:
                parsed = parse_bolt_pattern(front_pattern)
                # #region agent log
                try:
                    with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:379","message":"Front pattern parsed","data":{"front_pattern":front_pattern,"parsed":str(parsed) if parsed else None,"parsed_type":str(type(parsed[1])) if parsed else None},"timestamp":int(__import__('time').time()*1000)})+'\n')
                except: pass
                # #endregion
                if parsed:
                    bolt_patterns_to_match.append(parsed)
        
        if axle in ("rear", "both"):
            rear_pattern = vehicle_row.bolt_pattern_rear
            if rear_pattern:
                parsed = parse_bolt_pattern(rear_pattern)
                # #region agent log
                try:
                    with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:386","message":"Rear pattern parsed","data":{"rear_pattern":rear_pattern,"parsed":str(parsed) if parsed else None,"parsed_type":str(type(parsed[1])) if parsed else None},"timestamp":int(__import__('time').time()*1000)})+'\n')
                except: pass
                # #endregion
                if parsed:
                    # 避免重复（如果前后轴 bolt pattern 相同）
                    if parsed not in bolt_patterns_to_match:
                        bolt_patterns_to_match.append(parsed)
        
        if not bolt_patterns_to_match:
            # 没有有效的 bolt pattern，返回空列表
            return WheelsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
            )
        
        # 3. 构建查询条件：使用数值匹配 pcd_lugs 和 pcd_mm
        products_table = get_table("mini_wheel_product")
        specs_table = get_table("mini_wheel_product_spec")
        
        # #region agent log
        try:
            with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"C","location":"shop.py:403","message":"Tables retrieved","data":{"products_table_exists":products_table is not None,"specs_table_exists":specs_table is not None,"bolt_patterns_count":len(bolt_patterns_to_match),"bolt_patterns":[[lugs,str(mm)] for lugs,mm in bolt_patterns_to_match]},"timestamp":int(__import__('time').time()*1000)})+'\n')
        except: pass
        # #endregion
        
        # 构建 bolt pattern 匹配条件（OR 组合多个 pattern）
        spec_conditions = [
            specs_table.c.status == "normal",  # 只查询正常状态的规格
        ]
        
        # 添加 bolt pattern 匹配条件（使用 OR 组合多个 pattern）
        bolt_pattern_or_conditions = []
        for lugs, mm in bolt_patterns_to_match:
            # #region agent log
            try:
                with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:415","message":"Building condition","data":{"lugs":lugs,"mm":str(mm),"mm_type":str(type(mm))},"timestamp":int(__import__('time').time()*1000)})+'\n')
            except: pass
            # #endregion
            bolt_pattern_or_conditions.append(
                and_(
                    specs_table.c.pcd_lugs == lugs,
                    specs_table.c.pcd_mm == mm
                )
            )
        
        if bolt_pattern_or_conditions:
            spec_conditions.append(or_(*bolt_pattern_or_conditions))
        
        # 可选：直径过滤
        if diameter:
            spec_conditions.append(specs_table.c.diameter == diameter)
        
        # 4. 查询匹配的规格，获取对应的 product_id 列表
        # #region agent log
        try:
            with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:428","message":"Before spec query","data":{"spec_conditions_count":len(spec_conditions),"bolt_pattern_or_conditions_count":len(bolt_pattern_or_conditions)},"timestamp":int(__import__('time').time()*1000)})+'\n')
        except: pass
        # #endregion
        try:
            spec_ids_result = db.execute(
                select(distinct(specs_table.c.product_id))
                .where(and_(*spec_conditions))
            )
            matched_product_ids = [row[0] for row in spec_ids_result.fetchall()]
            # #region agent log
            try:
                with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:432","message":"Spec query success","data":{"matched_product_ids_count":len(matched_product_ids)},"timestamp":int(__import__('time').time()*1000)})+'\n')
            except: pass
            # #endregion
        except Exception as e:
            # #region agent log
            try:
                with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                    f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:428","message":"Spec query error","data":{"error_type":str(type(e).__name__),"error_msg":str(e)},"timestamp":int(__import__('time').time()*1000)})+'\n')
            except: pass
            # #endregion
            raise
        
        if not matched_product_ids:
            # 没有匹配的规格，返回空列表
            return WheelsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
            )
        
        # 5. 查询商品（添加商品状态和品牌过滤）
        product_conditions = [
            products_table.c.id.in_(matched_product_ids),
            products_table.c.status == "normal",  # 只查询正常状态的商品
        ]
        
        if brand_id:
            product_conditions.append(products_table.c.brand_id == brand_id)
        
        # 6. 查询商品总数
        count_result = db.execute(
            select(func.count(distinct(products_table.c.id)))
            .where(and_(*product_conditions))
        )
        total = count_result.scalar() or 0
        
        # 7. 查询商品列表（分页）
        offset = (page - 1) * page_size
        products_result = db.execute(
            select(products_table)
            .where(and_(*product_conditions))
            .order_by(products_table.c.weigh.desc(), products_table.c.createtime.desc())
            .limit(page_size)
            .offset(offset)
        )
        
        products = []
        for product_row in products_result.fetchall():
            # 查询该商品的所有匹配规格
            product_spec_conditions = [
                specs_table.c.product_id == product_row.id,
                specs_table.c.status == "normal",
            ]
            
            # 再次应用 bolt pattern 匹配（确保只返回匹配的规格）
            if bolt_pattern_or_conditions:
                product_spec_conditions.append(or_(*bolt_pattern_or_conditions))
            
            if diameter:
                product_spec_conditions.append(specs_table.c.diameter == diameter)
            
            specs_result = db.execute(
                select(specs_table)
                .where(and_(*product_spec_conditions))
                .order_by(specs_table.c.weigh.desc(), specs_table.c.createtime.desc())
            )
            
            specs = []
            for spec_row in specs_result.fetchall():
                # #region agent log
                try:
                    with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                        spec_dict = dict(spec_row._mapping) if hasattr(spec_row, '_mapping') else {}
                        f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"B","location":"shop.py:491","message":"Processing spec row","data":{"spec_id":spec_row.id,"has_original_price":hasattr(spec_row,'original_price'),"original_price_value":getattr(spec_row,'original_price',None),"original_price_type":str(type(getattr(spec_row,'original_price',None)))},"timestamp":int(__import__('time').time()*1000)})+'\n')
                except: pass
                # #endregion
                try:
                    specs.append(WheelSpecResponse(
                        spec_id=spec_row.id,
                        size=spec_row.size,
                        diameter=str(spec_row.diameter) if spec_row.diameter else None,
                        width=str(spec_row.width) if spec_row.width else None,
                        pcd=spec_row.pcd,
                        offset=str(spec_row.offset) if spec_row.offset else None,
                        center_bore=str(spec_row.center_bore) if spec_row.center_bore else None,
                        price=float(spec_row.sale_price) if spec_row.sale_price else None,
                        original_price=float(spec_row.original_price) if spec_row.original_price else None,
                        stock=spec_row.stock or 0,
                    ))
                except Exception as e:
                    # #region agent log
                    try:
                        with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                            f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"B","location":"shop.py:492","message":"Error creating WheelSpecResponse","data":{"error_type":str(type(e).__name__),"error_msg":str(e),"spec_id":spec_row.id},"timestamp":int(__import__('time').time()*1000)})+'\n')
                    except: pass
                    # #endregion
                    raise
            
            # 如果商品有匹配的规格，才添加到结果中
            if specs:
                # 价格信息在规格级别，不在产品级别
                # 可以从规格中获取最低价格作为产品价格（可选）
                min_price = None
                min_original_price = None
                if specs:
                    prices = [s.price for s in specs if s.price is not None]
                    original_prices = [s.original_price for s in specs if s.original_price is not None]
                    if prices:
                        min_price = min(prices)
                    if original_prices:
                        min_original_price = min(original_prices)
                
                products.append(WheelProductResponse(
                    product_id=product_row.id,
                    name=product_row.name,
                    brand_id=product_row.brand_id,
                    brand_name=None,  # 可以后续 JOIN brand 表获取
                    image=product_row.image,
                    sale_price=min_price,  # 使用规格中的最低价格
                    original_price=min_original_price,  # 使用规格中的最低原价
                    price_per=None,  # mini_wheel_product 表没有这个字段
                    stock=0,  # 商品级别的库存可能需要从规格汇总
                    status=product_row.status,
                    specs=specs,
                ))
        
        # #region agent log
        try:
            with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"A","location":"shop.py:558","message":"Function exit","data":{"products_count":len(products),"total":total},"timestamp":int(__import__('time').time()*1000)})+'\n')
        except: pass
        # #endregion
        
        return WheelsListResponse(
            items=products,
            total=total,
            page=page,
            page_size=page_size,
        )
    except Exception as e:
        # #region agent log
        try:
            import traceback
            with open(r'c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log', 'a', encoding='utf-8') as f:
                f.write(json.dumps({"sessionId":"debug-session","runId":"run1","hypothesisId":"D","location":"shop.py:570","message":"Unhandled exception","data":{"error_type":str(type(e).__name__),"error_msg":str(e),"traceback":traceback.format_exc()},"timestamp":int(__import__('time').time()*1000)})+'\n')
        except: pass
        # #endregion
        raise



