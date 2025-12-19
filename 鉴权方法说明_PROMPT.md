你是一个有真实生产经验的后端安全工程师 + FastAPI 架构师。
目标：为同一套业务 API 提供两种客户端鉴权方式：Web（浏览器）与小程序（Bearer JWT），两者必须隔离且不混用。

### 现状（Web 已实现）
- Web 端鉴权只能来自 HttpOnly Cookie：
  - access_token（短期）
  - refresh_token（长期）
- 登录/注册接口不做 CSRF 双提交校验，但必须做严格 Origin/Referer 白名单校验（verify_origin_only），成功后下发 csrf_token（非 HttpOnly）。
- 所有写接口（POST/PUT/PATCH/DELETE）必须显式添加 verify_csrf_token（Origin 白名单 + X-CSRF-Token == csrf_token Cookie）。
- get_current_user 仅从 Cookie 读取 access_token，严禁读取 Authorization Header。

### 需求（预留小程序 JWT）
- 小程序/APP 使用 Authorization: Bearer <JWT> 作为唯一鉴权来源，不使用 Cookie，不使用 CSRF。
- Web 端 API 禁止兼容 Bearer；小程序端 API 禁止使用 Cookie 登录态。
- 两套认证必须在路由层隔离（推荐按前缀或子域），但业务逻辑可复用：最终都产出统一的 current_user（含 user_id）。

### 设计要求（主流做法）
1) 路由隔离（二选一，优先前缀隔离）：
   - /api/v1/web/*：Cookie-only + CSRF（Double Submit Cookie）
   - /api/v1/mini/*：Bearer-only JWT（Authorization Header）
2) 认证依赖隔离：
   - get_current_user_web(request): 只读 Cookie access_token
   - get_current_user_mini(request): 只读 Authorization: Bearer JWT
3) 业务接口复用：
   - 业务 router 只依赖一个抽象 current_user（由 web/mini router 注入不同依赖）
4) 安全边界：
   - Web 不允许出现“如果有 Authorization 就用 Authorization，否则用 Cookie”的兼容逻辑
   - Mini 不允许从 Cookie 读取 token
5) 输出内容必须包含：
   - 目录/文件落点建议（deps.py、routers 的组织方式）
   - 关键依赖函数签名与调用方式
   - CSRF 应用范围说明（仅 Web 写接口）
   - 错误处理策略（401/403 的区分）
   - 最少示例：一个需要登录的 GET，一个写接口 POST 在 Web 下如何加 CSRF，在 Mini 下如何鉴权

请给出可落地的实现方案与示例代码骨架（不要伪代码），并解释为何这种隔离能避免 Web 与 Mini 认证模型相互污染。