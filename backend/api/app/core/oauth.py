"""
OAuth 客户端：微信小程序、Gmail
"""
import httpx
from typing import Optional, Dict, Any
from app.config import settings


async def get_wechat_openid(
    code: str,
    app_id: Optional[str] = None,
    app_secret: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """
    通过微信小程序 code 获取 openid 和 session_key
    
    Args:
        code: 微信小程序登录 code
        app_id: 小程序 AppID（默认使用配置）
        app_secret: 小程序 AppSecret（默认使用配置）
    
    Returns:
        包含 openid、unionid、session_key 的字典，失败返回 None
    """
    app_id = app_id or settings.WECHAT_MINIAPP_APPID
    app_secret = app_secret or settings.WECHAT_MINIAPP_SECRET
    
    if not app_id or not app_secret:
        return None
    
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {
        "appid": app_id,
        "secret": app_secret,
        "js_code": code,
        "grant_type": "authorization_code"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            result = response.json()
            
            if "openid" in result:
                return {
                    "openid": result["openid"],
                    "unionid": result.get("unionid"),
                    "session_key": result.get("session_key"),
                }
            else:
                return None
    except Exception:
        return None


async def verify_google_id_token(id_token: str) -> Optional[Dict[str, Any]]:
    """
    验证 Google ID Token
    
    Args:
        id_token: Google ID Token 字符串
    
    Returns:
        包含用户信息的字典，失败返回 None
    
    注意：这里使用简化验证，生产环境建议使用 google-auth 库进行完整验证
    """
    if not settings.GOOGLE_CLIENT_ID:
        return None
    
    try:
        # 使用 Google 的 tokeninfo 端点验证（简化版）
        # 生产环境建议使用 google-auth 库进行完整验证
        url = "https://oauth2.googleapis.com/tokeninfo"
        params = {"id_token": id_token}
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)
            result = response.json()
            
            # 检查 audience（client_id）是否匹配
            if result.get("aud") != settings.GOOGLE_CLIENT_ID:
                return None
            
            return {
                "sub": result.get("sub"),  # Google 用户ID
                "email": result.get("email"),
                "name": result.get("name"),
                "picture": result.get("picture"),
            }
    except Exception:
        return None

