"""
地址簿 API 路由
Web 端：Cookie 认证 + CSRF 校验
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_
from datetime import datetime
from typing import Optional
from app.database import get_db, get_table
from app.api.deps import get_current_user, verify_csrf_token
from app.core.address_cache import AddressCache
from app.schemas.address import (
    AddressCreate,
    AddressUpdate,
    AddressResponse,
    AddressListResponse,
    SetDefaultRequest,
)

router = APIRouter()


def ensure_default_address_exists(
    db: Session,
    user_id: int,
    address_type: str,
    exclude_address_id: Optional[int] = None
) -> None:
    """
    确保该用户该类型有默认地址（兜底检查）
    
    如果该用户该类型有活跃地址但没有默认地址，自动设置第一个为默认
    
    Args:
        db: 数据库会话
        user_id: 用户ID
        address_type: 地址类型
        exclude_address_id: 排除的地址ID（用于删除场景）
    """
    addresses_table = get_table("mini_user_address")
    
    # 查询该用户该类型的所有活跃地址
    conditions = [
        addresses_table.c.user_id == user_id,
        addresses_table.c.address_type == address_type,
        addresses_table.c.deletetime.is_(None)
    ]
    if exclude_address_id:
        conditions.append(addresses_table.c.id != exclude_address_id)
    
    result = db.execute(
        select(addresses_table)
        .where(and_(*conditions))
        .order_by(addresses_table.c.createtime.asc())
    )
    active_addresses = result.fetchall()
    
    if not active_addresses:
        # 没有活跃地址，不需要默认地址
        return
    
    # 检查是否有默认地址
    has_default = any(addr.is_default == 1 for addr in active_addresses)
    
    if not has_default:
        # 没有默认地址，设置第一个为默认
        first_address = active_addresses[0]
        db.execute(
            addresses_table.update()
            .where(addresses_table.c.id == first_address.id)
            .values(is_default=1)
        )


def set_default_address(
    db: Session,
    user_id: int,
    address_id: int,
    address_type: str
) -> None:
    """
    设置默认地址（事务保证：同类型只能有一个默认）
    
    使用 SELECT ... FOR UPDATE 行锁防止并发问题
    
    Args:
        db: 数据库会话
        user_id: 用户ID
        address_id: 要设为默认的地址ID
        address_type: 地址类型
    """
    addresses_table = get_table("mini_user_address")
    
    # 开启事务（如果不在事务中）
    # SQLAlchemy 默认自动提交，我们需要显式控制事务
    
    # 1. 先验证地址存在且属于该用户
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.id == address_id,
                addresses_table.c.user_id == user_id,
                addresses_table.c.deletetime.is_(None)
            )
        )
    )
    target_address = result.fetchone()
    
    if not target_address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在或已被删除"
        )
    
    # 2. 使用 SELECT ... FOR UPDATE 锁定该用户该类型的所有活跃地址
    # 注意：SQLAlchemy Core 需要使用 with_for_update()
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.user_id == user_id,
                addresses_table.c.address_type == address_type,
                addresses_table.c.deletetime.is_(None)
            )
        )
        .with_for_update()
    )
    addresses_to_update = result.fetchall()
    
    # 3. 将所有同类型地址的 is_default 置为 0
    if addresses_to_update:
        address_ids = [addr.id for addr in addresses_to_update]
        db.execute(
            addresses_table.update()
            .where(addresses_table.c.id.in_(address_ids))
            .values(is_default=0)
        )
    
    # 4. 将目标地址的 is_default 置为 1
    db.execute(
        addresses_table.update()
        .where(addresses_table.c.id == address_id)
        .values(is_default=1)
    )
    
    # 提交事务（由调用者控制）


@router.get("", response_model=AddressListResponse, summary="获取地址列表")
async def get_addresses(
    address_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取当前用户的地址列表（带缓存）
    
    - 只返回未删除的地址（deletetime IS NULL）
    - 默认地址优先排序
    - 可选的 address_type 过滤（shipping/billing）
    - Cache-Aside 模式：先查缓存，miss 则查DB并回填
    """
    user_id = current_user["id"]
    
    # 1. 先尝试从缓存获取
    cached_list = AddressCache.get_address_list(user_id, address_type)
    if cached_list is not None:
        # 缓存命中，直接返回（缓存中的数据已经是转换后的格式）
        return AddressListResponse(
            addresses=[AddressResponse(**addr) for addr in cached_list],
            total=len(cached_list)
        )
    
    # 2. 缓存未命中，查询数据库
    addresses_table = get_table("mini_user_address")
    
    # 构建查询条件
    conditions = [
        addresses_table.c.user_id == user_id,
        addresses_table.c.deletetime.is_(None)
    ]
    
    if address_type:
        if address_type not in ('shipping', 'billing'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="地址类型必须是 shipping 或 billing"
            )
        conditions.append(addresses_table.c.address_type == address_type)
    
    # 查询地址列表（默认地址优先）
    result = db.execute(
        select(addresses_table)
        .where(and_(*conditions))
        .order_by(addresses_table.c.is_default.desc(), addresses_table.c.createtime.desc())
    )
    addresses = result.fetchall()
    
    # 转换为响应格式
    address_list = []
    address_dict_list = []
    for addr in addresses:
        addr_dict = dict(addr._mapping)
        # 转换 int (0/1) 为 bool
        if 'is_default' in addr_dict:
            addr_dict['is_default'] = bool(addr_dict['is_default'])
        if 'is_shippable' in addr_dict:
            addr_dict['is_shippable'] = bool(addr_dict['is_shippable'])
        address_list.append(AddressResponse(**addr_dict))
        address_dict_list.append(addr_dict)
    
    # 3. 回填缓存
    AddressCache.set_address_list(user_id, address_dict_list, address_type)
    
    return AddressListResponse(
        addresses=address_list,
        total=len(address_list)
    )


@router.get("/{address_id}", response_model=AddressResponse, summary="获取单个地址")
async def get_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    获取单个地址详情（带缓存）
    
    - 权限校验：只能查看自己的地址
    - Cache-Aside 模式：先查缓存，miss 则查DB并回填
    """
    user_id = current_user["id"]
    
    # 1. 先尝试从缓存获取
    cached_address = AddressCache.get_address_detail(user_id, address_id)
    if cached_address is not None:
        # 缓存命中，直接返回（缓存中的数据已经是转换后的格式）
        return AddressResponse(**cached_address)
    
    # 2. 缓存未命中，查询数据库
    addresses_table = get_table("mini_user_address")
    
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.id == address_id,
                addresses_table.c.user_id == user_id,
                addresses_table.c.deletetime.is_(None)
            )
        )
    )
    address = result.fetchone()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在或已被删除"
        )
    
    address_dict = dict(address._mapping)
    
    # 3. 回填缓存
    AddressCache.set_address_detail(user_id, address_id, address_dict)
    
    return AddressResponse(**address_dict)


@router.post("", response_model=AddressResponse, status_code=status.HTTP_201_CREATED, summary="创建地址")
async def create_address(
    request: AddressCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(verify_csrf_token),  # CSRF 校验
):
    """
    创建新地址
    
    - 权限：自动设置 user_id = current_user.id
    - 默认地址逻辑：
      - 如果这是该类型第一条地址，自动设为默认
      - 如果指定 is_default=True，执行默认地址设置流程
    - CSRF：需要校验
    """
    user_id = current_user["id"]
    addresses_table = get_table("mini_user_address")
    
    # 检查该用户该类型是否已有地址
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.user_id == user_id,
                addresses_table.c.address_type == request.address_type,
                addresses_table.c.deletetime.is_(None)
            )
        )
    )
    existing_addresses = result.fetchall()
    
    # 确定是否设为默认
    is_default = False
    if not existing_addresses:
        # 第一条地址，自动设为默认
        is_default = True
    elif request.is_default:
        # 用户指定设为默认，需要执行默认地址设置流程
        is_default = True
    
    # 准备插入数据
    now_timestamp = int(datetime.utcnow().timestamp())
    insert_data = {
        "user_id": user_id,
        "address_type": request.address_type,
        "is_default": 1 if is_default else 0,
        "first_name": request.first_name,
        "last_name": request.last_name,
        "company": request.company,
        "phone_country_code": request.phone_country_code,
        "phone_number": request.phone_number,
        "country_code": request.country_code,
        "province": request.province,
        "province_code": request.province_code,
        "city": request.city,
        "district": request.district,
        "address_line1": request.address_line1,
        "address_line2": request.address_line2,
        "postal_code": request.postal_code,
        "tax_region": request.tax_region,
        "shipping_zone": request.shipping_zone,
        "is_shippable": 1 if request.is_shippable else 0,
        "createtime": now_timestamp,
        "updatetime": now_timestamp,
    }
    
    # 如果需要设为默认，先执行默认地址设置流程
    if is_default:
        # 先插入地址（is_default 已在 insert_data 中设置），然后调用设置默认函数确保事务一致性
        result = db.execute(
            addresses_table.insert().values(**insert_data)
        )
        db.commit()
        new_address_id = result.lastrowid
        
        # 设置默认地址（事务保证）
        set_default_address(db, user_id, new_address_id, request.address_type)
        db.commit()
        
        # 重新查询地址
        result = db.execute(
            select(addresses_table)
            .where(addresses_table.c.id == new_address_id)
        )
        new_address = result.fetchone()
    else:
        # 直接插入
        result = db.execute(
            addresses_table.insert().values(**insert_data)
        )
        db.commit()
        new_address_id = result.lastrowid
        
        # 查询新创建的地址
        result = db.execute(
            select(addresses_table)
            .where(addresses_table.c.id == new_address_id)
        )
        new_address = result.fetchone()
    
    address_dict = dict(new_address._mapping)
    
    # 转换 int (0/1) 为 bool
    if 'is_default' in address_dict:
        address_dict['is_default'] = bool(address_dict['is_default'])
    if 'is_shippable' in address_dict:
        address_dict['is_shippable'] = bool(address_dict['is_shippable'])
    
    # 失效相关缓存（创建地址后）
    AddressCache.invalidate_user_addresses(user_id)
    
    return AddressResponse(**address_dict)


@router.patch("/{address_id}", response_model=AddressResponse, summary="更新地址")
async def update_address(
    address_id: int,
    request: AddressUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(verify_csrf_token),  # CSRF 校验
):
    """
    更新地址
    
    - 权限校验：只能更新自己的地址
    - 如果更新 is_default，执行默认地址设置流程
    - CSRF：需要校验
    """
    user_id = current_user["id"]
    addresses_table = get_table("mini_user_address")
    
    # 先验证地址存在且属于该用户
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.id == address_id,
                addresses_table.c.user_id == user_id,
                addresses_table.c.deletetime.is_(None)
            )
        )
    )
    address = result.fetchone()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在或已被删除"
        )
    
    address_dict = dict(address._mapping)
    address_type = address_dict.get("address_type")
    
    # 准备更新数据（只更新提供的字段）
    update_data = {}
    if request.address_type is not None:
        update_data["address_type"] = request.address_type
        address_type = request.address_type  # 更新地址类型（如果改变）
    if request.first_name is not None:
        update_data["first_name"] = request.first_name
    if request.last_name is not None:
        update_data["last_name"] = request.last_name
    if request.company is not None:
        update_data["company"] = request.company
    if request.phone_country_code is not None:
        update_data["phone_country_code"] = request.phone_country_code
    if request.phone_number is not None:
        update_data["phone_number"] = request.phone_number
    if request.country_code is not None:
        update_data["country_code"] = request.country_code
    if request.province is not None:
        update_data["province"] = request.province
    if request.province_code is not None:
        update_data["province_code"] = request.province_code
    if request.city is not None:
        update_data["city"] = request.city
    if request.district is not None:
        update_data["district"] = request.district
    if request.address_line1 is not None:
        update_data["address_line1"] = request.address_line1
    if request.address_line2 is not None:
        update_data["address_line2"] = request.address_line2
    if request.postal_code is not None:
        update_data["postal_code"] = request.postal_code
    if request.tax_region is not None:
        update_data["tax_region"] = request.tax_region
    if request.shipping_zone is not None:
        update_data["shipping_zone"] = request.shipping_zone
    if request.is_shippable is not None:
        update_data["is_shippable"] = 1 if request.is_shippable else 0
    
    # 如果更新 is_default，需要执行默认地址设置流程
    if request.is_default is not None:
        if request.is_default:
            # 设置为默认地址
            set_default_address(db, user_id, address_id, address_type)
        else:
            # 取消默认地址（需要确保还有其他默认地址）
            # 先取消当前默认
            db.execute(
                addresses_table.update()
                .where(addresses_table.c.id == address_id)
                .values(is_default=0)
            )
            # 检查是否需要设置其他地址为默认
            ensure_default_address_exists(db, user_id, address_type, exclude_address_id=address_id)
    
    # 更新其他字段
    if update_data:
        update_data["updatetime"] = int(datetime.utcnow().timestamp())
        db.execute(
            addresses_table.update()
            .where(addresses_table.c.id == address_id)
            .values(**update_data)
        )
    
    db.commit()
    
    # 重新查询更新后的地址
    result = db.execute(
        select(addresses_table)
        .where(addresses_table.c.id == address_id)
    )
    updated_address = result.fetchone()
    address_dict = dict(updated_address._mapping)
    
    # 失效相关缓存（更新地址后）
    AddressCache.invalidate_user_addresses(user_id)
    
    return AddressResponse(**address_dict)


@router.post("/{address_id}/set-default", response_model=AddressResponse, summary="设置默认地址")
async def set_default(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(verify_csrf_token),  # CSRF 校验
):
    """
    设置默认地址
    
    - 权限校验：只能设置自己的地址为默认
    - 事务保证：同类型只能有一个默认地址
    - CSRF：需要校验
    """
    user_id = current_user["id"]
    addresses_table = get_table("mini_user_address")
    
    # 先查询地址，获取地址类型
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.id == address_id,
                addresses_table.c.user_id == user_id,
                addresses_table.c.deletetime.is_(None)
            )
        )
    )
    address = result.fetchone()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在或已被删除"
        )
    
    address_dict = dict(address._mapping)
    address_type = address_dict.get("address_type")
    
    # 执行设置默认地址流程（事务保证）
    set_default_address(db, user_id, address_id, address_type)
    db.commit()
    
    # 重新查询地址
    result = db.execute(
        select(addresses_table)
        .where(addresses_table.c.id == address_id)
    )
    updated_address = result.fetchone()
    address_dict = dict(updated_address._mapping)
    
    # 转换 int (0/1) 为 bool
    if 'is_default' in address_dict:
        address_dict['is_default'] = bool(address_dict['is_default'])
    if 'is_shippable' in address_dict:
        address_dict['is_shippable'] = bool(address_dict['is_shippable'])
    
    # 失效相关缓存（设置默认地址后）
    AddressCache.invalidate_user_addresses(user_id)
    
    return AddressResponse(**address_dict)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除地址（软删除）")
async def delete_address(
    address_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    _: None = Depends(verify_csrf_token),  # CSRF 校验
):
    """
    删除地址（软删除）
    
    - 权限校验：只能删除自己的地址
    - 软删除：设置 deletetime 时间戳
    - 默认地址检查：
      - 如果删除的是默认地址，且同类型还有其他地址，自动设置第一个为默认
      - 如果删除后没有地址了，允许没有默认地址（合理）
    - CSRF：需要校验
    """
    user_id = current_user["id"]
    addresses_table = get_table("mini_user_address")
    
    # 先查询地址
    result = db.execute(
        select(addresses_table)
        .where(
            and_(
                addresses_table.c.id == address_id,
                addresses_table.c.user_id == user_id,
                addresses_table.c.deletetime.is_(None)
            )
        )
    )
    address = result.fetchone()
    
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="地址不存在或已被删除"
        )
    
    address_dict = dict(address._mapping)
    address_type = address_dict.get("address_type")
    is_default = address_dict.get("is_default") == 1
    
    # 执行软删除
    now_timestamp = int(datetime.utcnow().timestamp())
    db.execute(
        addresses_table.update()
        .where(addresses_table.c.id == address_id)
        .values(deletetime=now_timestamp, updatetime=now_timestamp)
    )
    
    # 如果删除的是默认地址，检查是否需要设置其他地址为默认
    if is_default:
        ensure_default_address_exists(db, user_id, address_type, exclude_address_id=address_id)
    
    db.commit()
    
    # 失效相关缓存（删除地址后）
    AddressCache.invalidate_user_addresses(user_id)
    
    return None


