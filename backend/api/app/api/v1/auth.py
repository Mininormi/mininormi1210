"""
认证路由：登录、刷新Token、登出、注册、验证码
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy import select, or_
from datetime import datetime
import secrets
import re
from app.database import get_db, get_table
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_csrf_token
)
from app.core.redis_client import redis_client
from app.core.email import send_verification_code_email
from app.core.verification_code import verification_code_client
from app.api.deps import verify_csrf_token, verify_origin_only
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    UserInfo,
    SendVerificationCodeRequest,
    SendVerificationCodeResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
    RegisterRequest,
    RegisterResponse
)
from app.schemas.user import UserResponse
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()


@router.post("/login", response_model=LoginResponse, summary="账号密码登录")
async def login(
    request: LoginRequest,
    req: Request,
    response: Response,
    db: Session = Depends(get_db),
    _: None = Depends(verify_origin_only)  # Origin 校验（首次请求还没有 CSRF Token）
):
    """
    账号密码登录
    
    支持用户名、邮箱登录（暂不支持手机号）
    Token 通过 HttpOnly Cookie 返回
    """
    account = request.account.strip()
    password = request.password
    
    # 获取用户表
    users_table = get_table("fa_user")
    
    # 判断账号类型并查询用户
    # 包含@为邮箱，否则为用户名
    if "@" in account:
        # 邮箱登录
        result = db.execute(
            select(users_table).where(users_table.c.email == account)
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
            detail="账号或密码错误"
        )
    
    user_dict = dict(user_row._mapping)
    
    # 检查用户状态
    if user_dict.get("status") != "normal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="账号已被锁定"
        )
    
    # 验证密码
    salt = user_dict.get("salt", "")
    hashed_password = user_dict.get("password", "")
    
    if not verify_password(password, salt, hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="账号或密码错误"
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
    
    # 根据 remember_me 设置不同的 refresh_token 过期时间
    # 未勾选：1 天，勾选：15 天
    if request.remember_me:
        refresh_token_expire_days = 15
    else:
        refresh_token_expire_days = 1
    
    refresh_token_expire_seconds = refresh_token_expire_days * 24 * 3600
    
    # 生成 Refresh Token
    refresh_token = redis_client.generate_refresh_token()
    redis_client.set_refresh_token(
        refresh_token=refresh_token,
        user_id=user_dict["id"],
        device_id=device_id,
        device_type=device_type,
        expire_seconds=refresh_token_expire_seconds
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
    
    # 设置 HttpOnly Cookie
    is_production = not settings.DEBUG
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,  # 生产环境使用 HTTPS
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=refresh_token_expire_seconds,
    )
    
    # 设置 CSRF Token Cookie（非 HttpOnly，前端需要读取）
    # 安全说明：攻击者读不到 cookie 主要靠同源策略，SameSite 影响的是"跨站请求是否带 cookie"
    # CSRF Token 过期时间与 refresh_token 保持一致，确保不会在 refresh_token 过期之前过期
    csrf_token = generate_csrf_token()
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,  # 非 HttpOnly，前端需要读取
        secure=is_production,
        samesite="lax",  # 与 access_token 保持一致
        max_age=refresh_token_expire_seconds,  # 与 refresh_token 过期时间保持一致
    )
    
    # 返回响应（只返回用户信息，Token 通过 Cookie 返回）
    return LoginResponse(
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


@router.post("/refresh", summary="刷新Access Token")
async def refresh_token(
    req: Request,
    response: Response,
    db: Session = Depends(get_db),
    _: None = Depends(verify_csrf_token)  # CSRF 校验
):
    """
    使用 Refresh Token 刷新 Access Token
    
    Web API：从 Cookie 中读取 refresh_token，通过 Cookie 返回新的 access_token
    """
    # 从 Cookie 获取 refresh_token（Web API 只支持 Cookie）
    refresh_token = req.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    # 从 Redis 获取 Refresh Token 信息
    token_data = redis_client.get_refresh_token(refresh_token)
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # 生成新的 Access Token
    access_token = create_access_token(
        user_id=token_data["user_id"],
        device_id=token_data["device_id"],
        device_type=token_data["device_type"]
    )
    
    # 生成新的 CSRF Token（刷新时同时刷新 CSRF Token）
    csrf_token = generate_csrf_token()
    
    # 计算 refresh_token 的剩余过期时间（从 Redis 中获取的 token_data 包含过期时间信息）
    # 如果 refresh_token 还有效，CSRF Token 的过期时间应该与 refresh_token 的剩余时间保持一致
    from datetime import datetime
    expire_time = datetime.fromtimestamp(token_data["expire_time"])
    remaining_seconds = int((expire_time - datetime.utcnow()).total_seconds())
    # 确保至少还有 1 小时的有效期
    csrf_token_expire_seconds = max(remaining_seconds, 3600)
    
    # 通过 Cookie 返回新的 access_token 和 csrf_token
    is_production = not settings.DEBUG
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
    )
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,  # 非 HttpOnly，前端需要读取
        secure=is_production,
        samesite="lax",  # 与 access_token 保持一致
        max_age=csrf_token_expire_seconds,  # 与 refresh_token 的剩余过期时间保持一致
    )
    
    # 返回空响应（Token 通过 Cookie 返回）
    return {"message": "Token refreshed successfully"}


@router.post("/logout", summary="登出")
async def logout(
    req: Request,
    response: Response,
    db: Session = Depends(get_db),
    _: None = Depends(verify_csrf_token)  # CSRF 校验
):
    """
    登出（撤销 Refresh Token）
    
    Web API：从 Cookie 中读取 refresh_token
    """
    # 从 Cookie 获取 refresh_token（Web API 只支持 Cookie）
    refresh_token = req.cookies.get("refresh_token")
    
    if refresh_token:
        # 从 Redis 删除
        redis_client.delete_refresh_token(refresh_token)
    
    # 清除所有认证相关的 Cookie
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    response.delete_cookie(key="csrf_token", path="/")
    
    return {"message": "Logged out successfully"}


@router.post("/send-verification-code", response_model=SendVerificationCodeResponse, summary="发送邮箱验证码")
async def send_verification_code(
    request: SendVerificationCodeRequest,
    req: Request
):
    """
    发送邮箱验证码
    
    验证码有效期为 5 分钟
    同一邮箱每 120 秒只能发送一次
    同一 IP 每 120 秒只能发送一次
    
    注意：此接口不要求 CSRF Token（未登录用户可能没有），改用强限流/风控（IP+邮箱维度）
    """
    email = request.email.lower().strip()
    
    # 获取客户端 IP
    client_ip = req.client.host if req.client else "unknown"
    
    # 检查邮箱维度的发送频率限制
    if not verification_code_client.check_rate_limit(email):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="发送过于频繁，请稍后再试"
        )
    
    # 检查 IP 维度的发送频率限制
    if not verification_code_client.check_ip_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="发送过于频繁，请稍后再试"
        )
    
    # 生成验证码
    code = verification_code_client.generate_code()
    
    # 存储验证码到 Redis
    if not verification_code_client.set_code(email, code):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="验证码生成失败，请稍后再试"
        )
    
    # 发送邮件
    if not send_verification_code_email(email, code):
        # 如果发送失败，删除已存储的验证码
        verification_code_client.delete_code(email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="邮件发送失败，请检查邮箱配置或稍后再试"
        )
    
    return SendVerificationCodeResponse(
        message="验证码已发送，请查收邮件",
        rate_limit_seconds=settings.VERIFICATION_CODE_RATE_LIMIT_SECONDS
    )


@router.post("/verify-code", response_model=VerifyCodeResponse, summary="验证邮箱验证码")
async def verify_code(request: VerifyCodeRequest):
    """
    验证邮箱验证码
    
    验证成功后验证码会被删除（一次性使用）
    """
    email = request.email.lower().strip()
    code = request.code.strip()
    
    # 验证验证码
    if verification_code_client.verify_code(email, code):
        return VerifyCodeResponse(
            valid=True,
            message="验证码正确"
        )
    else:
        return VerifyCodeResponse(
            valid=False,
            message="验证码错误或已过期"
        )


@router.post("/register", response_model=RegisterResponse, summary="用户注册")
async def register(
    request: RegisterRequest,
    req: Request,
    response: Response,
    db: Session = Depends(get_db),
    _: None = Depends(verify_origin_only)  # Origin 校验（首次请求还没有 CSRF Token）
):
    """
    用户注册
    
    需要先发送验证码并验证
    注册成功后自动登录，Token 通过 HttpOnly Cookie 返回
    """
    email = request.email.lower().strip()
    password = request.password
    verification_code = request.verification_code.strip()
    
    # 验证验证码
    if not verification_code_client.verify_code(email, verification_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码错误或已过期"
        )
    
    # 获取用户表
    users_table = get_table("fa_user")
    
    # 检查邮箱是否已存在
    result = db.execute(
        select(users_table).where(users_table.c.email == email)
    )
    if result.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="该邮箱已被注册"
        )
    
    # 生成用户名（如果未提供，使用邮箱前缀）
    if request.username:
        username = request.username.strip()
        # 检查用户名是否已存在
        result = db.execute(
            select(users_table).where(users_table.c.username == username)
        )
        if result.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该用户名已被使用"
            )
    else:
        # 使用邮箱前缀作为用户名
        username = email.split("@")[0]
        # 如果用户名已存在，添加随机后缀
        result = db.execute(
            select(users_table).where(users_table.c.username == username)
        )
        if result.fetchone():
            username = f"{username}_{secrets.token_hex(4)}"
    
    # 生成盐值
    salt = secrets.token_hex(8)
    
    # 加密密码
    hashed_password = hash_password(password, salt)
    
    # 生成昵称
    nickname = request.nickname.strip() if request.nickname else username
    
    # 创建用户
    now_timestamp = int(datetime.utcnow().timestamp())
    client_ip = req.client.host if req.client else None
    user_id_result = db.execute(
        users_table.insert().values(
            username=username,
            nickname=nickname,
            email=email,
            password=hashed_password,
            salt=salt,
            status="normal",
            createtime=now_timestamp,
            updatetime=now_timestamp,
            joinip=client_ip,  # 注册时的 IP 地址
            jointime=now_timestamp,  # 注册时间
            logintime=now_timestamp,  # 注册成功后自动登录，记录登录时间
            loginip=client_ip,  # 注册成功后自动登录，记录登录 IP
            loginfailure=0,  # 初始化登录失败次数为 0
        )
    )
    db.commit()
    
    # 获取新创建的用户ID
    user_id = user_id_result.lastrowid
    
    # 生成设备ID
    device_id = secrets.token_urlsafe(32)
    device_type = "web"
    
    # 生成 Token
    access_token = create_access_token(
        user_id=user_id,
        device_id=device_id,
        device_type=device_type
    )
    
    # 注册时 refresh_token 使用默认过期时间（30天）
    refresh_token_expire_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
    
    # 生成 Refresh Token
    refresh_token = redis_client.generate_refresh_token()
    redis_client.set_refresh_token(
        refresh_token=refresh_token,
        user_id=user_id,
        device_id=device_id,
        device_type=device_type,
        expire_seconds=refresh_token_expire_seconds
    )
    
    # 设置 HttpOnly Cookie
    is_production = not settings.DEBUG
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
    )
    
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=refresh_token_expire_seconds,
    )
    
    # 设置 CSRF Token Cookie（非 HttpOnly，前端需要读取）
    # 安全说明：攻击者读不到 cookie 主要靠同源策略，SameSite 影响的是"跨站请求是否带 cookie"
    # CSRF Token 过期时间与 refresh_token 保持一致，确保不会在 refresh_token 过期之前过期
    csrf_token = generate_csrf_token()
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,  # 非 HttpOnly，前端需要读取
        secure=is_production,
        samesite="lax",  # 与 access_token 保持一致
        max_age=refresh_token_expire_seconds,  # 与 refresh_token 过期时间保持一致
    )
    
    # 获取用户信息
    result = db.execute(
        select(users_table).where(users_table.c.id == user_id)
    )
    user_row = result.fetchone()
    user_dict = dict(user_row._mapping)
    
    # 返回响应（只返回用户信息，Token 通过 Cookie 返回）
    return RegisterResponse(
        user=UserInfo(
            id=user_dict["id"],
            username=user_dict.get("username", ""),
            nickname=user_dict.get("nickname"),
            email=user_dict.get("email"),
            mobile=user_dict.get("mobile"),
            avatar=user_dict.get("avatar"),
            platform=user_dict.get("platform", "web"),
        ),
        message="注册成功"
    )


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

