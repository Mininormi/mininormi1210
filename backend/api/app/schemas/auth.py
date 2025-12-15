"""
认证相关的 Pydantic 模式
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """账号密码登录请求"""
    account: str = Field(..., description="账号（用户名/邮箱/手机号）")
    password: str = Field(..., min_length=6, description="密码")


class RefreshTokenRequest(BaseModel):
    """刷新 Token 请求"""
    refresh_token: str = Field(..., description="Refresh Token")


class LogoutRequest(BaseModel):
    """登出请求"""
    refresh_token: str = Field(..., description="Refresh Token")


class WechatMiniAppLoginRequest(BaseModel):
    """微信小程序登录请求"""
    code: str = Field(..., description="微信登录 code")
    device_id: Optional[str] = Field(None, description="设备ID（可选）")


class GmailLoginRequest(BaseModel):
    """Gmail OAuth 登录请求"""
    id_token: str = Field(..., description="Google ID Token")
    device_id: Optional[str] = Field(None, description="设备ID（可选）")


class TokenResponse(BaseModel):
    """Token 响应"""
    access_token: str = Field(..., description="Access Token")
    refresh_token: str = Field(..., description="Refresh Token")
    token_type: str = Field(default="bearer", description="Token 类型")
    expires_in: int = Field(..., description="Access Token 过期时间（秒）")


class UserInfo(BaseModel):
    """用户信息"""
    id: int
    username: str
    nickname: Optional[str] = None
    email: Optional[str] = None
    mobile: Optional[str] = None
    avatar: Optional[str] = None
    platform: Optional[str] = None


class LoginResponse(BaseModel):
    """登录响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserInfo

