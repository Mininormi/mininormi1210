"""
依赖注入：用户认证等
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from app.database import get_db, get_table
from app.core.security import verify_access_token
from app.schemas.user import UserResponse

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """
    获取当前登录用户（依赖注入）
    
    使用方式：
        @app.get("/me")
        def get_me(current_user: dict = Depends(get_current_user)):
            ...
    """
    token = credentials.credentials
    
    # 验证 Access Token
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    # 从数据库查询用户信息
    users_table = get_table("fa_user")
    result = db.execute(
        select(users_table).where(users_table.c.id == user_id)
    )
    user_row = result.fetchone()
    
    if not user_row:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    user_dict = dict(user_row._mapping)
    
    # 检查用户状态
    if user_dict.get("status") != "normal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is locked",
        )
    
    return user_dict


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[dict]:
    """
    获取当前登录用户（可选，未登录返回 None）
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

