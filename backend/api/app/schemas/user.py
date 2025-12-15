"""
用户相关的 Pydantic 模式
"""
from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    """用户信息响应"""
    id: int
    username: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    avatar: Optional[str] = None
    platform: Optional[str] = None
    level: Optional[int] = None
    score: Optional[int] = None

