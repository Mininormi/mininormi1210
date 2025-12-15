"""
安全相关功能：密码加密、JWT Token
"""
import hashlib
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.config import settings


def hash_password(password: str, salt: str) -> str:
    """
    密码加密（兼容 FastAdmin 的 MD5+salt 方式）
    FastAdmin 使用：md5(md5(password) + salt)
    
    Args:
        password: 明文密码
        salt: 盐值
    
    Returns:
        加密后的密码
    """
    return hashlib.md5((hashlib.md5(password.encode()).hexdigest() + salt).encode()).hexdigest()


def verify_password(password: str, salt: str, hashed: str) -> bool:
    """
    验证密码
    
    Args:
        password: 明文密码
        salt: 盐值
        hashed: 已加密的密码
    
    Returns:
        是否匹配
    """
    return hash_password(password, salt) == hashed


def create_access_token(
    user_id: int,
    device_id: str = "",
    device_type: str = "web",
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    创建 JWT Access Token
    
    Args:
        user_id: 用户ID
        device_id: 设备ID
        device_type: 设备类型（web/miniapp/app）
        expires_delta: 过期时间增量（默认2小时）
    
    Returns:
        JWT Token 字符串
    """
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    
    payload = {
        "user_id": user_id,
        "device_id": device_id,
        "device_type": device_type,
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    }
    
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> Optional[Dict[str, Any]]:
    """
    验证 JWT Access Token
    
    Args:
        token: JWT Token 字符串
    
    Returns:
        解码后的 payload，如果无效则返回 None
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # 检查 token 类型
        if payload.get("type") != "access":
            return None
        
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

