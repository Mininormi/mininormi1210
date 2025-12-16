# XSS 防护安全指南

本文档说明项目的 XSS（跨站脚本攻击）防护策略和实施细节。

## 目录

1. [防护策略概述](#防护策略概述)
2. [CSP（内容安全策略）配置](#csp内容安全策略配置)
3. [开发环境配置](#开发环境配置)
4. [生产环境配置](#生产环境配置)
5. [环境切换说明](#环境切换说明)
6. [安全响应头说明](#安全响应头说明)
7. [常见问题](#常见问题)

---

## 防护策略概述

本项目采用多层 XSS 防护策略：

1. **安全响应头**：通过 HTTP 响应头设置安全策略
2. **CSP（内容安全策略）**：控制允许加载的资源来源
3. **输入验证和清理**：后端对用户输入进行验证和清理
4. **React 自动转义**：前端 React 默认转义所有输出

---

## CSP（内容安全策略）配置

### CSP 模式说明

项目使用自定义环境变量 `CSP_ENV` 控制 CSP 模式：

- **`dev`**：开发模式（允许 HMR、eval、inline）
- **`prod`**：生产模式（严格，但允许 inline 样式）
- **`report-only`**：生产测试模式（只报告不拦截）

### 开发环境 CSP 策略

**配置位置**：`frontend/next.config.ts`

```typescript
const devCSP = [
  "default-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:* ws://localhost:* wss://localhost:*",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:*",
  "style-src 'self' 'unsafe-inline' http://localhost:*",
  "img-src 'self' data: https: http://localhost:*",
  "font-src 'self' data: http://localhost:*",
  "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:*",
  "frame-ancestors 'none'",
].join('; ')
```

**特点**：
- ✅ 允许 `unsafe-eval`：Next.js HMR（热模块替换）需要
- ✅ 允许 `unsafe-inline`：开发工具和内联脚本需要
- ✅ 允许 `localhost:*`：开发服务器和 WebSocket 连接
- ✅ 允许 WebSocket：HMR 实时更新需要

### 生产环境 CSP 策略

**配置位置**：`frontend/next.config.ts`

```typescript
const prodCSP = [
  "default-src 'self'",
  "script-src 'self'",  // 脚本严格禁止 inline
  "style-src 'self' 'unsafe-inline'",  // ⚠️ 样式允许 inline（Next.js/React 需要）
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join('; ')
```

**特点**：
- ❌ **禁止 `unsafe-eval`**：防止代码注入攻击
- ❌ **脚本禁止 `unsafe-inline`**：防止 XSS 攻击
- ✅ **样式允许 `unsafe-inline`**：Next.js/React 会生成内联样式，必须允许
- ✅ 只允许同源资源（`'self'`）
- ✅ 强制 HTTPS（`upgrade-insecure-requests`）

**⚠️ 重要说明**：
- `style-src 'self' 'unsafe-inline'` 是必需的，因为 Next.js 和 React 组件库会生成内联样式
- 如果禁止 inline 样式，会导致页面样式丢失或异常
- 脚本仍然严格禁止 inline，这是安全的

---

## 开发环境配置

### Docker Compose 配置

**文件**：`docker-compose.yml`

```yaml
frontend:
  environment:
    - NODE_ENV=development
    - CSP_ENV=dev  # 开发模式 CSP
  command: npm run dev -- -H 0.0.0.0 --webpack  # 明确指定开发命令
```

### 启动方式

```bash
# 方式 1：使用 docker-compose
docker compose up frontend

# 方式 2：直接运行
cd frontend
npm run dev
```

### 开发环境特点

- ✅ Next.js HMR（热更新）正常工作
- ✅ React DevTools 正常工作
- ✅ 开发工具和调试功能正常
- ✅ WebSocket 连接正常（HMR）

---

## 生产环境配置

### 部署流程

#### 阶段 1：生产测试（上线前）

**配置**：
```yaml
environment:
  - NODE_ENV=production
  - CSP_ENV=report-only  # 测试模式，只报告不拦截
command: sh -c "npm run build && npm start"
```

**目的**：
- 观察浏览器控制台的 CSP 违规报告
- 确认所有资源加载正常
- 验证 CSP 策略不会影响功能

**检查方法**：
1. 打开浏览器开发者工具
2. 查看 Console 中的 CSP 违规报告
3. 确认页面样式和功能正常

#### 阶段 2：生产上线（稳定后）

**配置**：
```yaml
environment:
  - NODE_ENV=production
  - CSP_ENV=prod  # 生产模式，严格拦截
command: sh -c "npm run build && npm start"
```

**目的**：
- 启用严格 CSP，拦截违规请求
- 防止 XSS 攻击

### 生产环境 Dockerfile 示例

**文件**：`docker/frontend/Dockerfile.prod`（可选）

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV CSP_ENV=prod

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 环境切换说明

### 关键事实

1. **Next.js 的 NODE_ENV 不是完全可靠的**
   - `next dev` 会强制走开发模式
   - `next start` 必须有 `next build` 的产物才是真 production

2. **硬规则**：
   - **开发**：`next dev`
   - **生产**：`next build && next start`

3. **使用自定义环境变量 `CSP_ENV`**
   - 不依赖 `NODE_ENV`（可能被工具链影响）
   - 明确控制 CSP 模式

### 环境变量对照表

| 环境 | NODE_ENV | CSP_ENV | Command | CSP 模式 |
|------|----------|---------|---------|----------|
| 本地开发 | development | dev | `npm run dev` | 宽松（允许 HMR/eval） |
| Docker 开发 | development | dev | `npm run dev` | 宽松（允许 HMR/eval） |
| 生产测试 | production | report-only | `npm run build && npm start` | 严格（只报告） |
| 生产上线 | production | prod | `npm run build && npm start` | 严格（拦截） |

---

## 安全响应头说明

### 已设置的安全响应头

1. **Content-Security-Policy**
   - 控制允许加载的资源来源
   - 防止 XSS 攻击

2. **X-Content-Type-Options: nosniff**
   - 防止浏览器 MIME 类型嗅探
   - 防止文件类型混淆攻击

3. **X-Frame-Options: DENY**
   - 防止页面被嵌入到 iframe
   - 防止点击劫持攻击

4. **Referrer-Policy: strict-origin-when-cross-origin**
   - 控制 Referer 信息的发送
   - 保护用户隐私

5. **Permissions-Policy**
   - 限制敏感 API（地理位置、摄像头、麦克风）
   - 防止未授权的功能访问

---

## 添加第三方资源

### 当需要添加第三方资源时（如 Google Fonts、Sentry）

**步骤**：

1. **确定资源类型**（script、style、font、img、connect 等）

2. **更新 `frontend/next.config.ts` 中的 CSP 配置**

   例如添加 Google Fonts：
   ```typescript
   const prodCSP = [
     "default-src 'self'",
     "script-src 'self'",
     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",  // 添加 Google Fonts
     "font-src 'self' data: https://fonts.gstatic.com",  // 添加字体 CDN
     // ...
   ].join('; ')
   ```

   例如添加 Sentry：
   ```typescript
   const prodCSP = [
     "default-src 'self'",
     "script-src 'self' https://browser.sentry-cdn.com",  // 添加 Sentry
     "connect-src 'self' https://sentry.io",  // 添加 Sentry API
     // ...
   ].join('; ')
   ```

3. **先在 `report-only` 模式测试**
   - 设置 `CSP_ENV=report-only`
   - 观察是否有 CSP 违规报告
   - 确认资源加载正常

4. **切换到 `prod` 模式**
   - 设置 `CSP_ENV=prod`
   - 验证功能正常

---

## 常见问题

### Q1: 为什么生产环境允许 `style-src 'unsafe-inline'`？

**A**: Next.js 和 React 组件库（如 Tailwind CSS）会生成内联样式。如果禁止 inline 样式，会导致：
- 页面样式丢失
- 组件样式异常
- 控制台出现 CSP 违规错误

**解决方案**：允许 inline 样式，但脚本仍然严格禁止 inline。

### Q2: 开发环境 CSP 会影响性能吗？

**A**: 不会。开发环境的宽松 CSP 只影响安全策略，不影响性能。HMR 和开发工具需要这些权限。

### Q3: 如何知道 CSP 是否正常工作？

**A**: 
1. 打开浏览器开发者工具
2. 查看 Network 标签，检查响应头中是否有 `Content-Security-Policy`
3. 查看 Console，如果有 CSP 违规会显示警告

### Q4: 生产环境上线后样式异常怎么办？

**A**: 
1. 检查 `style-src` 是否包含 `'unsafe-inline'`
2. 检查是否有第三方样式资源需要添加到白名单
3. 临时切换到 `report-only` 模式，查看 CSP 违规报告

### Q5: 如何测试 CSP 配置？

**A**: 
1. 设置 `CSP_ENV=report-only`
2. 访问所有页面，检查浏览器控制台
3. 确认没有 CSP 违规报告
4. 切换到 `CSP_ENV=prod` 正式启用

---

## 配置文件位置

- **CSP 配置**：`frontend/next.config.ts`
- **Docker 开发配置**：`docker-compose.yml`
- **Docker 生产配置**：`docker/frontend/Dockerfile.prod`（可选）

---

## 更新日志

- **2024-12-16**：初始实施 XSS 防护方案
  - 添加 CSP 配置（区分开发/生产环境）
  - 添加安全响应头
  - 生产环境允许 inline 样式（Next.js/React 需要）

---

## 参考文档

- [Next.js Content Security Policy](https://nextjs.org/docs/pages/guides/content-security-policy)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
