# RimSurge FastAPI 后端

FastAPI 客户端业务后端，提供 JWT + OAuth 多端登录功能。

## 功能特性

- ✅ JWT Access Token + Refresh Token 认证机制
- ✅ 账号密码登录（支持用户名/邮箱/手机号）
- ✅ 微信小程序登录（OAuth）
- ✅ Gmail OAuth 登录
- ✅ SQLAlchemy Core（无 ORM 模型维护）
- ✅ Redis Refresh Token 存储
- ✅ 与 PHP FastAdmin 共享数据库

## 技术栈

- **FastAPI**: Web 框架
- **SQLAlchemy Core**: 数据库操作（避免 ORM 模型维护）
- **Pydantic**: 数据验证和配置管理
- **PyJWT**: JWT Token 生成和验证
- **Redis**: Refresh Token 存储
- **httpx**: HTTP 客户端（调用第三方 API）

## 项目结构

```
backend/api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI 应用入口
│   ├── config.py            # 配置管理（Pydantic Settings）
│   ├── database.py          # 数据库连接（SQLAlchemy Core）
│   ├── api/
│   │   ├── deps.py          # 依赖注入（用户认证）
│   │   └── v1/
│   │       ├── auth.py      # 认证路由（登录、刷新、登出）
│   │       └── oauth.py     # OAuth 路由（微信、Gmail）
│   ├── core/
│   │   ├── security.py      # JWT、密码加密
│   │   ├── redis_client.py  # Redis 客户端
│   │   └── oauth.py        # OAuth 客户端
│   └── schemas/
│       ├── auth.py          # 认证相关 Pydantic 模式
│       └── user.py          # 用户相关 Pydantic 模式
├── requirements.txt         # Python 依赖
├── Dockerfile              # Docker 镜像
├── .env.example            # 环境变量示例
└── README.md               # 本文档
```

## 快速开始

### 1. 环境变量配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

### 2. Docker 启动

```bash
docker-compose up -d api
```

### 3. 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

## API 端点

### 认证相关

- `POST /api/v1/auth/login` - 账号密码登录
- `POST /api/v1/auth/refresh` - 刷新 Access Token
- `POST /api/v1/auth/logout` - 登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### OAuth 相关

- `POST /api/v1/oauth/wechat-miniapp` - 微信小程序登录
- `POST /api/v1/oauth/gmail` - Gmail OAuth 登录

## 数据库迁移

确保已执行数据库迁移脚本：

```sql
-- 执行 database/migrations/add_jwt_oauth_support.sql
```

## 配置说明

### JWT 配置

- `ACCESS_TOKEN_EXPIRE_HOURS`: Access Token 过期时间（默认 2 小时）
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh Token 过期时间（默认 30 天）

### OAuth 配置

需要在 `.env` 中配置：

- `WECHAT_MINIAPP_APPID`: 微信小程序 AppID
- `WECHAT_MINIAPP_SECRET`: 微信小程序 AppSecret
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret

## 安全注意事项

1. **生产环境必须修改 `JWT_SECRET`**
2. 使用 HTTPS 传输 Token
3. Refresh Token 存储在 Redis，支持快速撤销
4. Access Token 过期时间较短（2小时），降低泄露风险

## 开发说明

### SQLAlchemy Core 使用

不使用 ORM 模型，直接使用 Core API：

```python
from app.database import get_db, get_table

# 获取表对象
users_table = get_table("fa_user")

# 查询
result = db.execute(select(users_table).where(users_table.c.id == 1))
user = result.fetchone()
```

### 添加新的 API 端点

1. 在 `app/api/v1/` 创建新的路由文件
2. 在 `app/main.py` 中注册路由
3. 使用 `get_current_user` 依赖注入进行认证

## 许可证

MIT
