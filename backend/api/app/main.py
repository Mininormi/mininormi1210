"""
FastAPI 应用入口
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

# #region agent debug
# 启动时打印限流配置，确认环境变量是否正确加载
print(f"[STARTUP DEBUG] VERIFICATION_CODE_RATE_LIMIT_ENABLED: {settings.VERIFICATION_CODE_RATE_LIMIT_ENABLED}")
print(f"[STARTUP DEBUG] Type: {type(settings.VERIFICATION_CODE_RATE_LIMIT_ENABLED)}")
# #endregion
from app.api.v1 import auth
from app.core.redis_client import redis_client

# 创建 FastAPI 应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS 中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])


@app.get("/", summary="根路径")
async def root():
    """API 根路径"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health", summary="健康检查")
async def health():
    """健康检查端点"""
    # 检查 Redis 连接
    redis_ok = redis_client.ping()
    
    return {
        "status": "ok",
        "redis": "connected" if redis_ok else "disconnected",
    }

