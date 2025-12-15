"""
认证路由：登录、刷新Token、登出
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from datetime import datetime
import secrets
from app.database import get_db, get_table
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token
)
from app.core.redis_client import redis_client
from app.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    LogoutRequest,
    TokenResponse,
    LoginResponse,
    UserInfo
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="账号密码登录")
async def login(
    request: LoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    账号密码登录
    
    支持用户名、邮箱、手机号登录
    """
    account = request.account.strip()
    password = request.password
    
    # 获取用户表
    users_table = get_table("fa_user")
    
    # 判断账号类型并查询用户
    # 简单判断：包含@为邮箱，纯数字为手机号，否则为用户名
    if "@" in account:
        # 邮箱登录
        result = db.execute(
            select(users_table).where(users_table.c.email == account)
        )
    elif account.isdigit() and len(account) == 11:
        # 手机号登录
        result = db.execute(
            select(users_table).where(users_table.c.mobile == account)
        )
    else:
        # 用户名登录
        result = db.execute(
            select(users_table).where(users_table.c.username == account)
        )
    
    user_row = result.fetchone()
    
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account or password is incorrect"
        )
    
    user_dict = dict(user_row._mapping)
    
    # 检查用户状态
    if user_dict.get("status") != "normal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked"
        )
    
    # 验证密码
    salt = user_dict.get("salt", "")
    hashed_password = user_dict.get("password", "")
    
    if not verify_password(password, salt, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account or password is incorrect"
        )
    
    # 生成设备ID
    device_id = secrets.token_urlsafe(32)
    device_type = "web"
    
    # 生成 Token
    access_token = create_access_token(
        user_id=user_dict["id"],
        device_id=device_id,
        device_type=device_type
    )
    
    # 生成 Refresh Token
    refresh_token = redis_client.generate_refresh_token()
    redis_client.set_refresh_token(
        refresh_token=refresh_token,
        user_id=user_dict["id"],
        device_id=device_id,
        device_type=device_type
    )
    
    # 保存 Refresh Token 到数据库
    devices_table = get_table("fa_user_devices")
    expire_time = int((datetime.utcnow().timestamp() + 
                      settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600))
    
    db.execute(
        devices_table.insert().values(
            user_id=user_dict["id"],
            device_id=device_id,
            device_type=device_type,
            refresh_token=refresh_token,
            last_login_ip=req.client.host if req.client else None,
            last_login_time=int(datetime.utcnow().timestamp()),
            expire_time=expire_time,
            createtime=int(datetime.utcnow().timestamp()),
            updatetime=int(datetime.utcnow().timestamp()),
        )
    )
    
    # 更新用户最后登录时间
    db.execute(
        users_table.update()
        .where(users_table.c.id == user_dict["id"])
        .values(
            logintime=int(datetime.utcnow().timestamp()),
            loginip=req.client.host if req.client else None,
            loginfailure=0,
        )
    )
    
    db.commit()
    
    # 返回响应
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=UserInfo(
            id=user_dict["id"],
            username=user_dict.get("username", ""),
            nickname=user_dict.get("nickname"),
            email=user_dict.get("email"),
            mobile=user_dict.get("mobile"),
            avatar=user_dict.get("avatar"),
            platform=user_dict.get("platform", "web"),
        )
    )


@router.post("/refresh", response_model=TokenResponse, summary="刷新Access Token")
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    使用 Refresh Token 刷新 Access Token
    """
    refresh_token = request.refresh_token
    
    # 从 Redis 获取 Refresh Token 信息
    token_data = redis_client.get_refresh_token(refresh_token)
    
    if not token_data:
        # 尝试从数据库查询（兼容性）
        devices_table = get_table("fa_user_devices")
        result = db.execute(
            select(devices_table).where(
                devices_table.c.refresh_token == refresh_token
            )
        )
        device_row = result.fetchone()
        
        if not device_row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        device_dict = dict(device_row._mapping)
        
        # 检查是否过期
        if device_dict["expire_time"] < int(datetime.utcnow().timestamp()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token expired"
            )
        
        token_data = {
            "user_id": device_dict["user_id"],
            "device_id": device_dict["device_id"],
            "device_type": device_dict["device_type"],
        }
    
    # 生成新的 Access Token
    access_token = create_access_token(
        user_id=token_data["user_id"],
        device_id=token_data["device_id"],
        device_type=token_data["device_type"]
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,  # Refresh Token 不变
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
    )


@router.post("/logout", summary="登出")
async def logout(
    request: LogoutRequest,
    db: Session = Depends(get_db)
):
    """
    登出（撤销 Refresh Token）
    """
    refresh_token = request.refresh_token
    
    # 从 Redis 删除
    redis_client.delete_refresh_token(refresh_token)
    
    # 从数据库删除（可选，也可以保留用于审计）
    devices_table = get_table("fa_user_devices")
    db.execute(
        devices_table.delete().where(
            devices_table.c.refresh_token == refresh_token
        )
    )
    db.commit()
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse, summary="获取当前用户信息")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    获取当前登录用户信息
    """
    return UserResponse(
        id=current_user["id"],
        username=current_user.get("username", ""),
        nickname=current_user.get("nickname"),
        email=current_user.get("email"),
        mobile=current_user.get("mobile"),
        avatar=current_user.get("avatar"),
        platform=current_user.get("platform", "web"),
        level=current_user.get("level"),
        score=current_user.get("score"),
    )

