# FastAPI JWT + OAuth 登录架构设计

## 架构说明

- **FastAPI**：客户端业务后端（网站端、小程序）
- **PHP FastAdmin**：管理员后台（仅管理员使用）

## FastAPI 项目结构

```
backend/
├── fastapi/                    # FastAPI 后端
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI 应用入口
│   │   ├── config.py          # 配置文件
│   │   ├── database.py        # 数据库连接
│   │   ├── models/            # SQLAlchemy 模型
│   │   │   ├── __init__.py
│   │   │   └── user.py       # 用户模型
│   │   ├── schemas/           # Pydantic 模式
│   │   │   ├── __init__.py
│   │   │   ├── auth.py       # 认证相关模式
│   │   │   └── user.py       # 用户相关模式
│   │   ├── api/              # API 路由
│   │   │   ├── __init__.py
│   │   │   ├── deps.py       # 依赖注入（认证等）
│   │   │   ├── auth.py       # 认证路由
│   │   │   ├── oauth.py      # OAuth 路由
│   │   │   └── users.py      # 用户路由
│   │   ├── core/             # 核心功能
│   │   │   ├── __init__.py
│   │   │   ├── security.py   # JWT、密码加密
│   │   │   ├── oauth.py      # OAuth 客户端
│   │   │   └── redis.py      # Redis 连接（Refresh Token）
│   │   └── utils/            # 工具函数
│   │       ├── __init__.py
│   │       └── wechat.py     # 微信小程序工具
│   ├── requirements.txt      # Python 依赖
│   └── Dockerfile
└── admin/                     # PHP FastAdmin（管理员后台）
    └── ...
```

## 技术栈

- **FastAPI**：现代、快速的 Web 框架
- **SQLAlchemy**：ORM
- **Pydantic**：数据验证
- **PyJWT**：JWT Token
- **Redis**：Refresh Token 存储
- **httpx**：HTTP 客户端（调用微信/Google API）

## 数据库设计

### 用户表（与 PHP FastAdmin 共享）

```sql
-- 用户表（fa_user）
-- 需要添加的字段：
ALTER TABLE fa_user 
ADD COLUMN `openid` VARCHAR(64) NULL COMMENT '微信OpenID',
ADD COLUMN `unionid` VARCHAR(64) NULL COMMENT '微信UnionID',
ADD COLUMN `google_id` VARCHAR(64) NULL COMMENT 'Google用户ID',
ADD COLUMN `google_email` VARCHAR(128) NULL COMMENT 'Google邮箱',
ADD COLUMN `platform` VARCHAR(20) DEFAULT 'web' COMMENT '注册平台：web/miniapp/google',
ADD COLUMN `avatar_url` VARCHAR(255) NULL COMMENT '头像URL（第三方）';

-- 用户设备表（fa_user_devices）
CREATE TABLE IF NOT EXISTS `fa_user_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `device_id` varchar(64) NOT NULL,
  `device_type` varchar(20) NOT NULL COMMENT 'web/miniapp/app',
  `refresh_token` varchar(128) NOT NULL,
  `last_login_ip` varchar(50) NULL,
  `last_login_time` int(11) NULL,
  `expire_time` int(11) NOT NULL,
  `createtime` int(11) NULL,
  `updatetime` int(11) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_refresh_token` (`refresh_token`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## API 接口设计

### 1. 账号密码登录

**POST** `/api/v1/auth/login`

```json
{
  "account": "user@example.com",
  "password": "password123"
}
```

**响应：**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "uuid-refresh-token",
  "token_type": "bearer",
  "expires_in": 7200,
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@example.com"
  }
}
```

### 2. 微信小程序登录

**POST** `/api/v1/oauth/wechat-miniapp`

```json
{
  "code": "wx-login-code",
  "device_id": "optional-device-id"
}
```

### 3. Gmail OAuth 登录

**POST** `/api/v1/oauth/gmail`

```json
{
  "id_token": "google-id-token",
  "device_id": "optional-device-id"
}
```

### 4. 刷新 Token

**POST** `/api/v1/auth/refresh`

```json
{
  "refresh_token": "uuid-refresh-token"
}
```

### 5. 登出

**POST** `/api/v1/auth/logout`

```json
{
  "refresh_token": "uuid-refresh-token"
}
```

## 实现要点

### 1. JWT Token 生成

```python
# app/core/security.py
import jwt
from datetime import datetime, timedelta
from app.config import settings

def create_access_token(user_id: int, device_id: str = "", device_type: str = "web") -> str:
    expire = datetime.utcnow() + timedelta(hours=2)
    payload = {
        "user_id": user_id,
        "device_id": device_id,
        "device_type": device_type,
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")
```

### 2. Refresh Token 管理（Redis）

```python
# app/core/redis.py
import redis
import json
from datetime import datetime, timedelta

class RefreshTokenManager:
    def __init__(self):
        self.redis_client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            db=0,
            decode_responses=True
        )
    
    def generate(self, user_id: int, device_id: str, device_type: str) -> str:
        refresh_token = str(uuid.uuid4())
        expire_time = datetime.now() + timedelta(days=30)
        
        # 存储到 Redis
        self.redis_client.setex(
            f"refresh_token:{refresh_token}",
            30 * 24 * 3600,  # 30天
            json.dumps({
                "user_id": user_id,
                "device_id": device_id,
                "device_type": device_type,
                "expire_time": expire_time.timestamp()
            })
        )
        
        # 存储到数据库
        # ...
        
        return refresh_token
```

### 3. 微信小程序登录

```python
# app/utils/wechat.py
import httpx

async def get_wechat_openid(code: str, app_id: str, app_secret: str):
    url = "https://api.weixin.qq.com/sns/jscode2session"
    params = {
        "appid": app_id,
        "secret": app_secret,
        "js_code": code,
        "grant_type": "authorization_code"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()
```

### 4. Google OAuth 验证

```python
# app/core/oauth.py
from google.oauth2 import id_token
from google.auth.transport import requests

async def verify_google_token(id_token_str: str, client_id: str):
    try:
        idinfo = id_token.verify_oauth2_token(
            id_token_str, 
            requests.Request(), 
            client_id
        )
        return idinfo
    except ValueError:
        return None
```

## 配置文件示例

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # JWT
    JWT_SECRET: str = "your-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_HOURS: int = 2
    
    # Redis
    REDIS_HOST: str = "redis"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = "a123123"
    
    # Database
    DATABASE_URL: str = "mysql+pymysql://user:pass@mysql:3306/db"
    
    # OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    WECHAT_MINIAPP_APPID: str = ""
    WECHAT_MINIAPP_SECRET: str = ""
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## 下一步

1. 创建 FastAPI 项目结构
2. 实现 JWT Token 机制
3. 实现 Refresh Token 管理
4. 实现微信小程序登录
5. 实现 Gmail OAuth 登录
6. 实现用户认证中间件

需要我开始创建 FastAPI 项目代码吗？

