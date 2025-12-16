"""
FastAPI 应用入口
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
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

# CORS 中间件（必须在最前面，确保所有响应都包含 CORS 头）
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 全局异常处理，确保错误响应也包含 CORS 头
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """处理 HTTP 异常"""
    origin = request.headers.get("origin")
    # 检查 origin 是否在白名单中
    if origin and origin in settings.CORS_ORIGINS:
        cors_origin = origin
    else:
        cors_origin = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "*"
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """处理请求验证异常"""
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ORIGINS:
        cors_origin = origin
    else:
        cors_origin = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "*"
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """处理其他未捕获的异常"""
    import traceback
    print(f"[ERROR] Unhandled exception: {exc}")
    print(f"[ERROR] Traceback: {traceback.format_exc()}")
    
    origin = request.headers.get("origin")
    if origin and origin in settings.CORS_ORIGINS:
        cors_origin = origin
    else:
        cors_origin = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "*"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "内部服务器错误"},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
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

