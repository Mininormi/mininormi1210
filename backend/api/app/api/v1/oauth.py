"""
OAuth 路由：微信小程序、Gmail 登录
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
import secrets
from app.database import get_db, get_table
from app.core.security import create_access_token, hash_password
from app.core.redis_client import redis_client
from app.core.oauth import get_wechat_openid, verify_google_id_token
from app.schemas.auth import (
    WechatMiniAppLoginRequest,
    GmailLoginRequest,
    LoginResponse,
    UserInfo
)
from app.config import settings

router = APIRouter()


@router.post("/wechat-miniapp", response_model=LoginResponse, summary="微信小程序登录")
async def wechat_miniapp_login(
    request: WechatMiniAppLoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    微信小程序登录
    
    通过微信 code 获取 openid，自动创建或绑定用户
    """
    if not settings.WECHAT_MINIAPP_APPID or not settings.WECHAT_MINIAPP_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="WeChat MiniApp OAuth not configured"
        )
    
    # 获取微信 openid
    wechat_data = await get_wechat_openid(request.code)
    
    if not wechat_data or not wechat_data.get("openid"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to get WeChat openid"
        )
    
    openid = wechat_data["openid"]
    unionid = wechat_data.get("unionid")
    
    users_table = get_table("fa_user")
    devices_table = get_table("fa_user_devices")
    
    # 查找用户（优先通过 openid，其次通过 unionid）
    user_row = None
    
    if openid:
        result = db.execute(
            select(users_table).where(users_table.c.openid == openid)
        )
        user_row = result.fetchone()
    
    if not user_row and unionid:
        result = db.execute(
            select(users_table).where(users_table.c.unionid == unionid)
        )
        user_row = result.fetchone()
    
    # 如果用户不存在，创建新用户
    if not user_row:
        username = f"wx_{openid[-8:]}"
        salt = secrets.token_urlsafe(16)
        password = secrets.token_urlsafe(32)  # 随机密码（微信登录不需要密码）
        hashed_password = hash_password(password, salt)
        
        now = int(datetime.utcnow().timestamp())
        ip = req.client.host if req.client else None
        
        # 插入新用户
        result = db.execute(
            users_table.insert().values(
                username=username,
                nickname=username,
                password=hashed_password,
                salt=salt,
                openid=openid,
                unionid=unionid,
                platform="miniapp",
                level=1,
                score=0,
                avatar="",
                jointime=now,
                joinip=ip,
                logintime=now,
                loginip=ip,
                prevtime=now,
                status="normal",
            )
        )
        db.commit()
        
        # 获取新创建的用户
        result = db.execute(
            select(users_table).where(users_table.c.id == result.lastrowid)
        )
        user_row = result.fetchone()
    else:
        # 更新用户信息
        update_data = {
            "logintime": int(datetime.utcnow().timestamp()),
            "loginip": req.client.host if req.client else None,
            "loginfailure": 0,
        }
        
        if openid and not user_row.openid:
            update_data["openid"] = openid
        if unionid and not user_row.unionid:
            update_data["unionid"] = unionid
        
        db.execute(
            users_table.update()
            .where(users_table.c.id == user_row.id)
            .values(**update_data)
        )
        db.commit()
    
    user_dict = dict(user_row._mapping)
    
    # 检查用户状态
    if user_dict.get("status") != "normal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked"
        )
    
    # 生成设备ID
    device_id = request.device_id or secrets.token_urlsafe(32)
    device_type = "miniapp"
    
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
    
    # 保存到数据库
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
    db.commit()
    
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
            platform=user_dict.get("platform", "miniapp"),
        )
    )


@router.post("/gmail", response_model=LoginResponse, summary="Gmail OAuth登录")
async def gmail_login(
    request: GmailLoginRequest,
    req: Request,
    db: Session = Depends(get_db)
):
    """
    Gmail OAuth 登录
    
    通过 Google ID Token 验证并自动创建或绑定用户
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth not configured"
        )
    
    # 验证 Google ID Token
    google_data = await verify_google_id_token(request.id_token)
    
    if not google_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google ID token"
        )
    
    google_id = google_data.get("sub")
    google_email = google_data.get("email")
    
    if not google_id or not google_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google email not found"
        )
    
    users_table = get_table("fa_user")
    devices_table = get_table("fa_user_devices")
    
    # 查找用户（优先通过 google_id，其次通过邮箱）
    user_row = None
    
    if google_id:
        result = db.execute(
            select(users_table).where(users_table.c.google_id == google_id)
        )
        user_row = result.fetchone()
    
    if not user_row and google_email:
        result = db.execute(
            select(users_table).where(users_table.c.email == google_email)
        )
        user_row = result.fetchone()
    
    # 如果用户不存在，创建新用户
    if not user_row:
        username = f"gmail_{google_id[-8:]}"
        salt = secrets.token_urlsafe(16)
        password = secrets.token_urlsafe(32)  # 随机密码
        hashed_password = hash_password(password, salt)
        
        now = int(datetime.utcnow().timestamp())
        ip = req.client.host if req.client else None
        
        # 插入新用户
        result = db.execute(
            users_table.insert().values(
                username=username,
                nickname=google_data.get("name") or username,
                email=google_email,
                password=hashed_password,
                salt=salt,
                google_id=google_id,
                google_email=google_email,
                platform="google",
                avatar_url=google_data.get("picture"),
                level=1,
                score=0,
                avatar="",
                jointime=now,
                joinip=ip,
                logintime=now,
                loginip=ip,
                prevtime=now,
                status="normal",
            )
        )
        db.commit()
        
        # 获取新创建的用户
        result = db.execute(
            select(users_table).where(users_table.c.id == result.lastrowid)
        )
        user_row = result.fetchone()
    else:
        # 更新用户信息（绑定 Google 账号）
        update_data = {
            "logintime": int(datetime.utcnow().timestamp()),
            "loginip": req.client.host if req.client else None,
            "loginfailure": 0,
        }
        
        if google_id and not user_row.google_id:
            update_data["google_id"] = google_id
        if google_email and not user_row.google_email:
            update_data["google_email"] = google_email
        if not user_row.email:
            update_data["email"] = google_email
        if google_data.get("picture") and not user_row.avatar_url:
            update_data["avatar_url"] = google_data["picture"]
        
        db.execute(
            users_table.update()
            .where(users_table.c.id == user_row.id)
            .values(**update_data)
        )
        db.commit()
    
    user_dict = dict(user_row._mapping)
    
    # 检查用户状态
    if user_dict.get("status") != "normal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is locked"
        )
    
    # 生成设备ID
    device_id = request.device_id or secrets.token_urlsafe(32)
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
    
    # 保存到数据库
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
    db.commit()
    
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
            avatar=user_dict.get("avatar_url") or user_dict.get("avatar"),
            platform=user_dict.get("platform", "google"),
        )
    )

