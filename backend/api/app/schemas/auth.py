"""
认证相关的 Pydantic 模式
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    """账号密码登录请求"""
    account: str = Field(..., description="账号（用户名/邮箱/手机号）")
    password: str = Field(..., min_length=6, description="密码")
    remember_me: bool = Field(default=False, description="记住我（延长 refresh_token 过期时间）")


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
    """登录响应
    
    ⚠️ 安全说明：
    - Token 仅通过 HttpOnly Cookie 返回，不在响应体中返回
    - 响应体只返回用户信息，前端不应持有任何 token
    """
    user: UserInfo


class SendVerificationCodeRequest(BaseModel):
    """发送验证码请求"""
    email: EmailStr = Field(..., description="邮箱地址")


class SendVerificationCodeResponse(BaseModel):
    """发送验证码响应"""
    message: str = Field(default="验证码已发送", description="提示信息")
    rate_limit_seconds: Optional[int] = Field(None, description="剩余等待时间（秒）")


class VerifyCodeRequest(BaseModel):
    """验证验证码请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    code: str = Field(..., min_length=6, max_length=6, description="6位验证码")


class VerifyCodeResponse(BaseModel):
    """验证验证码响应"""
    valid: bool = Field(..., description="是否有效")
    message: str = Field(..., description="提示信息")


class RegisterRequest(BaseModel):
    """注册请求"""
    email: EmailStr = Field(..., description="邮箱地址")
    username: Optional[str] = Field(None, description="用户名（可选，默认使用邮箱前缀）")
    password: str = Field(..., min_length=6, description="密码")
    nickname: Optional[str] = Field(None, description="昵称")
    verification_code: str = Field(..., min_length=6, max_length=6, description="邮箱验证码")


class RegisterResponse(BaseModel):
    """注册响应
    
    ⚠️ 安全说明：
    - Token 仅通过 HttpOnly Cookie 返回，不在响应体中返回
    - 响应体只返回用户信息，前端不应持有任何 token
    """
    user: UserInfo
    message: str = Field(default="注册成功", description="提示信息")

