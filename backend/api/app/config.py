"""
FastAPI 配置文件
使用 Pydantic Settings 管理配置
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用基础配置
    APP_NAME: str = "RimSurge API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # JWT 配置
    JWT_SECRET: str = "sM4b2Qkrgxaho51z6NpVAH8SjF0ZfPBO"  # 请在生产环境修改
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 2  # Access Token 过期时间（小时）
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # Refresh Token 过期时间（天）
    
    # Redis 配置（用于 Refresh Token 存储）
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = "a123123"
    REDIS_DB: int = 0  # Token 专用数据库
    REDIS_DECODE_RESPONSES: bool = True
    
    # 数据库配置（与 PHP FastAdmin 共享）
    DATABASE_HOST: str = "mysql"
    DATABASE_PORT: int = 3306
    DATABASE_USER: str = "fastadmin"
    DATABASE_PASSWORD: str = "fastadmin123"
    DATABASE_NAME: str = "fastadmin"
    DATABASE_CHARSET: str = "utf8mb4"
    
    @property
    def DATABASE_URL(self) -> str:
        """构建数据库连接URL"""
        return (
            f"mysql+pymysql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}"
            f"@{self.DATABASE_HOST}:{self.DATABASE_PORT}/{self.DATABASE_NAME}"
            f"?charset={self.DATABASE_CHARSET}"
        )
    
    # OAuth 配置
    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # 微信小程序
    WECHAT_MINIAPP_APPID: Optional[str] = None
    WECHAT_MINIAPP_SECRET: Optional[str] = None
    
    # CORS 配置
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8001",
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

