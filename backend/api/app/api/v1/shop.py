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
from app.schemas.shop import WheelsListResponse, WheelProductResponse, WheelSpecResponse, BrandsListResponse, BrandResponse, WidthFacetItem, OffsetBucketItem
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


def parse_decimal_field(value: Optional[str]) -> Optional[Decimal]:
    """
    解析车辆字段（varchar）为 Decimal，处理 0/空值
    
    Args:
        value: 字符串值，如 "56.1", "0", "", None
    
    Returns:
        Decimal 或 None（如果值为空/0/None）
    """
    if not value:
        return None
    
    try:
        # 尝试转换为 Decimal
        decimal_value = Decimal(str(value).strip())
        # 如果值为 0，返回 None（表示无数据）
        if decimal_value == 0:
            return None
        return decimal_value
    except (ValueError, TypeError):
        return None


def parse_int_field(value: Optional[str]) -> Optional[int]:
    """
    解析车辆字段（varchar）为 int，处理 0/空值
    
    Args:
        value: 字符串值，如 "35", "0", "", None
    
    Returns:
        int 或 None（如果值为空/0/None）
    """
    if not value:
        return None
    
    try:
        int_value = int(float(str(value).strip()))
        if int_value == 0:
            return None
        return int_value
    except (ValueError, TypeError):
        return None


def get_effective_hub_bore(front_value: Optional[str], rear_value: Optional[str]) -> Optional[Decimal]:
    """
    获取有效的 Hub Bore 值（effective 值策略）
    
    规则：
    - 只有一边有值：用那一边
    - 两边都有值：取 max（更保守）
    - 两边都没值：返回 None（跳过该条件）
    """
    front = parse_decimal_field(front_value)
    rear = parse_decimal_field(rear_value)
    
    if front is not None and rear is not None:
        # 两边都有值，取 max（更保守）
        return max(front, rear)
    elif front is not None:
        return front
    elif rear is not None:
        return rear
    else:
        return None


def get_effective_offset_range(
    min_front: Optional[str], max_front: Optional[str],
    min_rear: Optional[str], max_rear: Optional[str]
) -> Optional[tuple]:
    """
    获取有效的 ET 安全区间（effective 值策略）
    
    规则：
    - 只有一边有值：用那一边
    - 两边都有值：取交集（更保守）
    - 交集为空：退化到 front（如果有值）
    - 两边都没值：返回 None（跳过该条件）
    
    Returns:
        (min_offset: int, max_offset: int) 或 None
    """
    min_f = parse_int_field(min_front)
    max_f = parse_int_field(max_front)
    min_r = parse_int_field(min_rear)
    max_r = parse_int_field(max_rear)
    
    # 检查 front 是否完整
    front_complete = min_f is not None and max_f is not None
    # 检查 rear 是否完整
    rear_complete = min_r is not None and max_r is not None
    
    if front_complete and rear_complete:
        # 两边都有值，取交集（更保守）
        effective_min = max(min_f, min_r)
        effective_max = min(max_f, max_r)
        # 如果交集为空，退化到 front
        if effective_min > effective_max:
            return (min_f, max_f)
        return (effective_min, effective_max)
    elif front_complete:
        return (min_f, max_f)
    elif rear_complete:
        return (min_r, max_r)
    else:
        return None


def get_effective_width(front_value: Optional[str], rear_value: Optional[str]) -> Optional[Decimal]:
    """
    获取有效的 J 值（宽度），用于计算 ±1 范围
    
    规则：
    - 只有一边有值：用那一边
    - 两边都有值：取交集范围（更保守）
    - 两边都没值：返回 None（跳过该条件）
    
    Returns:
        Decimal 或 None
    """
    front = parse_decimal_field(front_value)
    rear = parse_decimal_field(rear_value)
    
    if front is not None and rear is not None:
        # 两边都有值，取交集范围
        # front 范围: [front-1, front+1]
        # rear 范围: [rear-1, rear+1]
        # 交集: [max(front-1, rear-1), min(front+1, rear+1)]
        range_min = max(front - Decimal('1'), rear - Decimal('1'))
        range_max = min(front + Decimal('1'), rear + Decimal('1'))
        
        # 如果交集为空，退化到 front
        if range_min > range_max:
            return front
        
        # 返回交集的中点（或更保守的值）
        # 这里返回 front（实际范围会在调用处计算）
        return front
    elif front is not None:
        return front
    elif rear is not None:
        return rear
    else:
        return None


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
    # Spec 级筛选（规格表）
    min_price: Optional[float] = Query(None, ge=0, description="最低价格（CAD）"),
    max_price: Optional[float] = Query(None, ge=0, description="最高价格（CAD）"),
    min_width: Optional[float] = Query(None, ge=0, le=20, description="最小宽度（英寸，如：7.0）"),
    max_width: Optional[float] = Query(None, ge=0, le=20, description="最大宽度（英寸，如：10.0）"),
    min_offset: Optional[int] = Query(None, ge=-100, le=100, description="最小 ET（毫米，如：30）"),
    max_offset: Optional[int] = Query(None, ge=-100, le=100, description="最大 ET（毫米，如：45）"),
    tpms_compatible: Optional[bool] = Query(None, description="是否支持 TPMS（true=仅支持，false=仅不支持，不传=不限）"),
    # Product 级筛选（产品表）
    center_cap_included: Optional[bool] = Query(None, description="是否带中心盖（true=仅带，false=仅不带，不传=不限）"),
    hub_ring_included: Optional[bool] = Query(None, description="是否带中心环（true=仅带，false=仅不带，不传=不限）"),
    winter_approved: Optional[bool] = Query(None, description="是否冬季认证（true=仅认证，false=仅未认证，不传=不限）"),
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
                if parsed:
                    bolt_patterns_to_match.append(parsed)
        
        if axle in ("rear", "both"):
            rear_pattern = vehicle_row.bolt_pattern_rear
            if rear_pattern:
                parsed = parse_bolt_pattern(rear_pattern)
                if parsed:
                    # 避免重复（如果前后轴 bolt pattern 相同）
                    if parsed not in bolt_patterns_to_match:
                        bolt_patterns_to_match.append(parsed)
        
        if not bolt_patterns_to_match:
            # 没有有效的 bolt pattern，返回空列表
            oem_diameter_front = parse_diameter(vehicle_row.rim_diameter_front)
            oem_diameter_rear = parse_diameter(vehicle_row.rim_diameter_rear)
            return WheelsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                oem_diameter_front=oem_diameter_front,
                oem_diameter_rear=oem_diameter_rear,
                available_diameters=[],
            )
        
        # 2.1 获取 effective 值（Hub Bore, ET, J 值）
        effective_hub_bore = None
        if axle == "front":
            effective_hub_bore = parse_decimal_field(vehicle_row.hub_bore_front)
        elif axle == "rear":
            effective_hub_bore = parse_decimal_field(vehicle_row.hub_bore_rear)
        else:  # both
            effective_hub_bore = get_effective_hub_bore(
                vehicle_row.hub_bore_front,
                vehicle_row.hub_bore_rear
            )
        
        effective_offset_range = None
        if axle == "front":
            min_offset = parse_int_field(vehicle_row.min_offset_front)
            max_offset = parse_int_field(vehicle_row.max_offset_front)
            if min_offset is not None and max_offset is not None:
                effective_offset_range = (min_offset, max_offset)
        elif axle == "rear":
            min_offset = parse_int_field(vehicle_row.min_offset_rear)
            max_offset = parse_int_field(vehicle_row.max_offset_rear)
            if min_offset is not None and max_offset is not None:
                effective_offset_range = (min_offset, max_offset)
        else:  # both
            effective_offset_range = get_effective_offset_range(
                vehicle_row.min_offset_front,
                vehicle_row.max_offset_front,
                vehicle_row.min_offset_rear,
                vehicle_row.max_offset_rear
            )
        
        effective_width = None
        if axle == "front":
            effective_width = parse_decimal_field(vehicle_row.rim_width_front)
        elif axle == "rear":
            effective_width = parse_decimal_field(vehicle_row.rim_width_rear)
        else:  # both
            effective_width = get_effective_width(
                vehicle_row.rim_width_front,
                vehicle_row.rim_width_rear
            )
        
        # 2.2 解析 OEM diameter（用于前端 UI，不用于后端过滤）
        oem_diameter_front = parse_diameter(vehicle_row.rim_diameter_front)
        oem_diameter_rear = parse_diameter(vehicle_row.rim_diameter_rear)
        
        # 3. 构建查询条件：使用数值匹配 pcd_lugs 和 pcd_mm
        products_table = get_table("mini_wheel_product")
        specs_table = get_table("mini_wheel_product_spec")
        
        # 构建基础匹配条件（base_spec_conditions：不含 diameter，用于统计 available_diameters）
        base_spec_conditions = [
            specs_table.c.status == "normal",  # 只查询正常状态的规格
        ]
        
        # 添加 bolt pattern 匹配条件（使用 OR 组合多个 pattern）
        bolt_pattern_or_conditions = []
        for lugs, mm in bolt_patterns_to_match:
            bolt_pattern_or_conditions.append(
                and_(
                    specs_table.c.pcd_lugs == lugs,
                    specs_table.c.pcd_mm == mm
                )
            )
        
        if bolt_pattern_or_conditions:
            base_spec_conditions.append(or_(*bolt_pattern_or_conditions))
        
        # Hub Bore 匹配：center_bore >= vehicle_hub_bore
        if effective_hub_bore is not None:
            base_spec_conditions.append(specs_table.c.center_bore >= effective_hub_bore)
        
        # ET 匹配：offset 在 [min_offset, max_offset] 区间
        if effective_offset_range is not None:
            min_offset, max_offset = effective_offset_range
            base_spec_conditions.append(
                and_(
                    specs_table.c.offset >= min_offset,
                    specs_table.c.offset <= max_offset
                )
            )
        
        # J 值匹配：width 在 rim_width ± 1 范围
        if effective_width is not None:
            width_min = effective_width - Decimal('1')
            width_max = effective_width + Decimal('1')
            base_spec_conditions.append(
                and_(
                    specs_table.c.width >= width_min,
                    specs_table.c.width <= width_max
                )
            )
        
        # 构建规格级筛选条件（spec_filter_conditions：价格/宽度/ET/TPMS）
        spec_filter_conditions = []
        
        # 价格范围筛选
        if min_price is not None:
            spec_filter_conditions.append(specs_table.c.sale_price >= Decimal(str(min_price)))
        if max_price is not None:
            spec_filter_conditions.append(specs_table.c.sale_price <= Decimal(str(max_price)))
        
        # 宽度范围筛选
        if min_width is not None:
            spec_filter_conditions.append(specs_table.c.width >= Decimal(str(min_width)))
        if max_width is not None:
            spec_filter_conditions.append(specs_table.c.width <= Decimal(str(max_width)))
        
        # ET 范围筛选
        if min_offset is not None:
            spec_filter_conditions.append(specs_table.c.offset >= min_offset)
        if max_offset is not None:
            spec_filter_conditions.append(specs_table.c.offset <= max_offset)
        
        # TPMS 筛选
        if tpms_compatible is not None:
            spec_filter_conditions.append(specs_table.c.tpmscompatibleswitch == (1 if tpms_compatible else 0))
        
        # 构建完整匹配条件（spec_conditions：base + spec_filter + diameter 过滤，用于查询商品列表）
        spec_conditions = base_spec_conditions.copy()
        spec_conditions.extend(spec_filter_conditions)
        
        # diameter 过滤：如果传了 diameter 参数，添加到过滤条件
        if diameter is not None:
            spec_conditions.append(specs_table.c.diameter == diameter)
        
        # 4. 查询匹配的规格，获取对应的 product_id 列表
        spec_ids_result = db.execute(
            select(distinct(specs_table.c.product_id))
            .where(and_(*spec_conditions))
        )
        matched_product_ids = [row[0] for row in spec_ids_result.fetchall()]
        
        if not matched_product_ids:
            # 没有匹配的规格，返回空列表
            return WheelsListResponse(
                items=[],
                total=0,
                page=page,
                page_size=page_size,
                oem_diameter_front=oem_diameter_front,
                oem_diameter_rear=oem_diameter_rear,
                available_diameters=[],
                available_widths=[],
                available_offset_buckets=[],
            )
        
        # 5. 查询商品（添加商品状态和品牌过滤）
        product_conditions = [
            products_table.c.id.in_(matched_product_ids),
            products_table.c.status == "normal",  # 只查询正常状态的商品
        ]
        
        if brand_id:
            product_conditions.append(products_table.c.brand_id == brand_id)
        
        # 产品级筛选条件（Center Cap / Hub Ring / Winter Approved）
        if center_cap_included is not None:
            product_conditions.append(products_table.c.center_cap_included == (1 if center_cap_included else 0))
        if hub_ring_included is not None:
            product_conditions.append(products_table.c.hub_ring_included == (1 if hub_ring_included else 0))
        if winter_approved is not None:
            product_conditions.append(products_table.c.winterapprovedswitch == (1 if winter_approved else 0))
        
        # 5.1 统计所有匹配规格的 diameter（独立查询，不受分页和 diameter 过滤影响）
        # 使用 base_spec_conditions + spec_filter_conditions + product_filter_conditions（不含 diameter）
        # 确保 available_diameters 反映当前所有筛选条件下的可用尺寸（不含 diameter）
        # 这样用户点击任何尺寸按钮都能看到真实结果
        base_spec_with_filters = base_spec_conditions.copy()
        base_spec_with_filters.extend(spec_filter_conditions)
        
        base_matched_product_ids_result = db.execute(
            select(distinct(specs_table.c.product_id))
            .where(and_(*base_spec_with_filters))
        )
        base_matched_product_ids = [row[0] for row in base_matched_product_ids_result.fetchall()]
        
        if base_matched_product_ids:
            # 构建产品级过滤条件（用于 available_diameters 查询）
            base_product_filter_conditions = [
                products_table.c.status == "normal",
                products_table.c.id.in_(base_matched_product_ids),
            ]
            if brand_id:
                base_product_filter_conditions.append(products_table.c.brand_id == brand_id)
            if center_cap_included is not None:
                base_product_filter_conditions.append(products_table.c.center_cap_included == (1 if center_cap_included else 0))
            if hub_ring_included is not None:
                base_product_filter_conditions.append(products_table.c.hub_ring_included == (1 if hub_ring_included else 0))
            if winter_approved is not None:
                base_product_filter_conditions.append(products_table.c.winterapprovedswitch == (1 if winter_approved else 0))
            
            diameter_query = (
                select(distinct(specs_table.c.diameter))
                .select_from(
                    specs_table.join(products_table, specs_table.c.product_id == products_table.c.id)
                )
                .where(
                    and_(
                        *base_spec_with_filters,  # base_spec_conditions + spec_filter_conditions（不含 diameter）
                        *base_product_filter_conditions,  # 产品级筛选
                        specs_table.c.diameter.isnot(None),
                    )
                )
            )
            
            diameter_rows = db.execute(diameter_query).fetchall()
            # 强制转换为 int，确保类型一致
            available_diameters = sorted([int(r[0]) for r in diameter_rows if r[0] is not None])
            
            # 5.2 统计 Width facet（独立查询，不受分页和 width 过滤影响）
            # 构建用于 width facet 的条件：base_spec_conditions + 其它 spec_filter（不含 width）+ product_filter
            width_facet_spec_conditions = base_spec_conditions.copy()
            # 添加其它 spec_filter（价格、ET、TPMS），但不包含 width 过滤
            for condition in spec_filter_conditions:
                # 跳过 width 相关的条件（通过检查列名）
                if hasattr(condition, 'left') and hasattr(condition.left, 'name'):
                    if condition.left.name == 'width':
                        continue
                width_facet_spec_conditions.append(condition)
            
            width_facet_matched_ids_result = db.execute(
                select(distinct(specs_table.c.product_id))
                .where(and_(*width_facet_spec_conditions))
            )
            width_facet_matched_ids = [row[0] for row in width_facet_matched_ids_result.fetchall()]
            
            if width_facet_matched_ids:
                width_facet_product_conditions = [
                    products_table.c.status == "normal",
                    products_table.c.id.in_(width_facet_matched_ids),
                ]
                if brand_id:
                    width_facet_product_conditions.append(products_table.c.brand_id == brand_id)
                if center_cap_included is not None:
                    width_facet_product_conditions.append(products_table.c.center_cap_included == (1 if center_cap_included else 0))
                if hub_ring_included is not None:
                    width_facet_product_conditions.append(products_table.c.hub_ring_included == (1 if hub_ring_included else 0))
                if winter_approved is not None:
                    width_facet_product_conditions.append(products_table.c.winterapprovedswitch == (1 if winter_approved else 0))
                
                width_query = (
                    select(
                        specs_table.c.width,
                        func.count(distinct(specs_table.c.product_id)).label('cnt')
                    )
                    .select_from(
                        specs_table.join(products_table, specs_table.c.product_id == products_table.c.id)
                    )
                    .where(
                        and_(
                            *width_facet_spec_conditions,
                            *width_facet_product_conditions,
                            specs_table.c.width.isnot(None),
                        )
                    )
                    .group_by(specs_table.c.width)
                    .order_by(specs_table.c.width)
                )
                
                width_rows = db.execute(width_query).fetchall()
                available_widths = [
                    WidthFacetItem(value=float(row[0]), count=int(row[1]))
                    for row in width_rows if row[0] is not None
                ]
            else:
                available_widths = []
            
            # 5.3 统计 Offset bucket facet（独立查询，不受分页和 offset 过滤影响）
            # 预设的 Offset 范围桶（ET 值，单位：毫米）
            offset_buckets = [
                (-50, -31, "-50mm to -31mm"),
                (-30, -11, "-30mm to -11mm"),
                (-10, 10, "-10mm to 10mm"),
                (11, 20, "11mm to 20mm"),
                (21, 40, "21mm to 40mm"),
                (41, 60, "41mm to 60mm"),
                (61, 80, "61mm to 80mm"),
            ]
            
            # 构建用于 offset facet 的条件：base_spec_conditions + 其它 spec_filter（不含 offset）+ product_filter
            offset_facet_spec_conditions = base_spec_conditions.copy()
            # 添加其它 spec_filter（价格、宽度、TPMS），但不包含 offset 过滤
            for condition in spec_filter_conditions:
                if hasattr(condition, 'left') and hasattr(condition.left, 'name'):
                    if condition.left.name == 'offset':
                        continue
                offset_facet_spec_conditions.append(condition)
            
            offset_facet_matched_ids_result = db.execute(
                select(distinct(specs_table.c.product_id))
                .where(and_(*offset_facet_spec_conditions))
            )
            offset_facet_matched_ids = [row[0] for row in offset_facet_matched_ids_result.fetchall()]
            
            if offset_facet_matched_ids:
                offset_facet_product_conditions = [
                    products_table.c.status == "normal",
                    products_table.c.id.in_(offset_facet_matched_ids),
                ]
                if brand_id:
                    offset_facet_product_conditions.append(products_table.c.brand_id == brand_id)
                if center_cap_included is not None:
                    offset_facet_product_conditions.append(products_table.c.center_cap_included == (1 if center_cap_included else 0))
                if hub_ring_included is not None:
                    offset_facet_product_conditions.append(products_table.c.hub_ring_included == (1 if hub_ring_included else 0))
                if winter_approved is not None:
                    offset_facet_product_conditions.append(products_table.c.winterapprovedswitch == (1 if winter_approved else 0))
                
                available_offset_buckets = []
                
                for bucket_min, bucket_max, bucket_label in offset_buckets:
                    bucket_query = (
                        select(func.count(distinct(specs_table.c.product_id)).label('cnt'))
                        .select_from(
                            specs_table.join(products_table, specs_table.c.product_id == products_table.c.id)
                        )
                        .where(
                            and_(
                                *offset_facet_spec_conditions,
                                *offset_facet_product_conditions,
                                specs_table.c.offset.isnot(None),
                                specs_table.c.offset >= bucket_min,
                                specs_table.c.offset <= bucket_max,
                            )
                        )
                    )
                    bucket_count = db.execute(bucket_query).scalar() or 0
                    if bucket_count > 0:
                        available_offset_buckets.append(
                            OffsetBucketItem(
                                min=bucket_min,
                                max=bucket_max,
                                label=bucket_label,
                                count=int(bucket_count)
                            )
                        )
            else:
                available_offset_buckets = []
        else:
            available_diameters = []
            available_widths = []
            available_offset_buckets = []
        
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
            # 查询该商品的所有匹配规格（应用所有匹配条件）
            product_spec_conditions = [
                specs_table.c.product_id == product_row.id,
                specs_table.c.status == "normal",
            ]
            
            # 再次应用所有匹配条件（确保只返回匹配的规格）
            if bolt_pattern_or_conditions:
                product_spec_conditions.append(or_(*bolt_pattern_or_conditions))
            
            # Hub Bore 匹配
            if effective_hub_bore is not None:
                product_spec_conditions.append(specs_table.c.center_bore >= effective_hub_bore)
            
            # ET 匹配
            if effective_offset_range is not None:
                min_offset, max_offset = effective_offset_range
                product_spec_conditions.append(
                    and_(
                        specs_table.c.offset >= min_offset,
                        specs_table.c.offset <= max_offset
                    )
                )
            
            # J 值匹配
            if effective_width is not None:
                width_min = effective_width - Decimal('1')
                width_max = effective_width + Decimal('1')
                product_spec_conditions.append(
                    and_(
                        specs_table.c.width >= width_min,
                        specs_table.c.width <= width_max
                    )
                )
            
            # 应用规格级筛选条件（价格/宽度/ET/TPMS）
            product_spec_conditions.extend(spec_filter_conditions)
            
            # diameter 过滤：如果传了 diameter 参数，只返回该直径的规格
            if diameter is not None:
                product_spec_conditions.append(specs_table.c.diameter == diameter)
            
            specs_result = db.execute(
                select(specs_table)
                .where(and_(*product_spec_conditions))
                .order_by(specs_table.c.weigh.desc(), specs_table.c.createtime.desc())
            )
            
            specs = []
            for spec_row in specs_result.fetchall():
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
        
        # available_diameters, available_widths, available_offset_buckets 已在步骤 5.1-5.3 中通过独立查询统计完成（不受分页影响）
        
        return WheelsListResponse(
            items=products,
            total=total,
            page=page,
            page_size=page_size,
            oem_diameter_front=oem_diameter_front,
            oem_diameter_rear=oem_diameter_rear,
            available_diameters=available_diameters,
            available_widths=available_widths,
            available_offset_buckets=available_offset_buckets,
        )
    except Exception as e:
        raise



