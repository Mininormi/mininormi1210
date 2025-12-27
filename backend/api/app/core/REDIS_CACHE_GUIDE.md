# Redis 用户缓存使用指南

## 概述

本项目使用 Redis DB=3 专门存放用户访问缓存（地址、订单、物流等），采用 **Cache-Aside（旁路缓存）** 模式。

## Redis 数据库分配

- **DB=0**：认证相关（Refresh Token、Session）
- **DB=3**：用户访问缓存（地址、订单、物流等）← **新增**
- **DB=10**：验证码相关

## 缓存策略：Cache-Aside

### 读操作流程
1. 先查 Redis 缓存
2. 如果缓存命中（Hit），直接返回
3. 如果缓存未命中（Miss），查询数据库
4. 将查询结果写入缓存（回填），设置 TTL

### 写操作流程
1. 先更新数据库（事务保证数据一致性）
2. 数据库提交成功后，失效相关缓存
3. 使用版本号机制批量失效（避免逐个删除 key）

## 地址缓存 Key 设计

### Key 命名规范
```
usercache:addr:v{version}:u{user_id}:{type}:{identifier}
```

### 具体 Key 示例
- **版本号**：`usercache:addr:ver:u{user_id}`（用于批量失效）
- **地址列表（全部）**：`usercache:addr:v{version}:u{user_id}:list:all`
- **地址列表（收货）**：`usercache:addr:v{version}:u{user_id}:list:shipping`
- **地址列表（账单）**：`usercache:addr:v{version}:u{user_id}:list:billing`
- **单个地址**：`usercache:addr:v{version}:u{user_id}:id:{address_id}`
- **默认地址（收货）**：`usercache:addr:v{version}:u{user_id}:default:shipping`
- **默认地址（账单）**：`usercache:addr:v{version}:u{user_id}:default:billing`

### 版本号机制
- 每次写操作（create/update/delete/set-default）后，递增版本号
- 旧版本的 key 自动失效（新请求使用新版本号，无法命中旧缓存）
- 优点：批量失效，无需逐个删除 key
- 缺点：旧 key 会占用内存直到 TTL 过期（可接受，因为 TTL 较短）

## TTL 设置

- **默认 TTL**：1800 秒（30分钟）
- **版本号 TTL**：7 天（确保版本号不会丢失）

## 缓存失效策略

### 写操作后的失效
所有写操作（create/update/delete/set-default）都会调用：
```python
AddressCache.invalidate_user_addresses(user_id)
```

这会：
1. 递增版本号（`usercache:addr:ver:u{user_id}`）
2. 使所有旧版本的缓存 key 自动失效
3. 新请求使用新版本号，自然无法命中旧缓存

### 失效时机
- **必须在数据库事务提交成功后**才失效缓存
- 如果数据库操作失败，不应该失效缓存（保持缓存一致性）

## 使用示例

### 读取地址列表（带缓存）
```python
# 1. 先查缓存
cached_list = AddressCache.get_address_list(user_id, address_type)
if cached_list is not None:
    return cached_list

# 2. 缓存未命中，查数据库
addresses = db.query(...)

# 3. 回填缓存
AddressCache.set_address_list(user_id, addresses, address_type)
```

### 创建地址（写后失效）
```python
# 1. 插入数据库
db.execute(insert...)
db.commit()

# 2. 失效缓存（必须在 commit 之后）
AddressCache.invalidate_user_addresses(user_id)
```

## 安全注意事项

1. **权限隔离**：所有缓存 key 都包含 `user_id`，确保用户只能访问自己的缓存
2. **PII 保护**：地址是敏感信息，不要将完整地址写入日志
3. **缓存穿透防护**：如果数据库查询结果为空，也应该缓存（缓存空结果，避免频繁查询数据库）
4. **缓存雪崩防护**：TTL 可以添加随机抖动（当前未实现，可后续优化）

## 公共缓存（DB=1）使用指南

### 用途
公共缓存用于存储 Web 和小程序游客可访问的公共数据，无需登录即可访问。

### 适用场景
- 品牌列表（Featured Brands）
- 车型数据（Year/Make/Model）
- 商品筛选条件
- 首页推荐数据
- 其他公开的、访问频率高的数据

### Key 命名规范
```
publiccache:{cache_type}:v{version}:{identifier}
```

### 使用示例
```python
from app.core.public_cache_client import public_cache_client
import json

# 获取品牌列表（带缓存）
def get_brands_cached():
    version = public_cache_client.get_version("brands")
    key = f"publiccache:brands:v{version}:list"
    
    cached = public_cache_client.get(key)
    if cached:
        return json.loads(cached)
    
    # 缓存未命中，查询数据库
    brands = db.query(...)
    
    # 回填缓存
    public_cache_client.set(key, json.dumps(brands), ttl=3600)
    return brands

# 失效品牌缓存（当品牌数据更新时）
def invalidate_brands_cache():
    public_cache_client.bump_version("brands")
```

### TTL 设置
- **默认 TTL**：3600 秒（1小时）
- **版本号 TTL**：7 天

## 监控和调试

### Redis Commander
访问 `http://localhost:8083` 可以查看 Redis 数据：
- 选择 `publiccache` 连接（DB=1）- 公共缓存
- 选择 `usercache` 连接（DB=3）- 用户缓存
- 选择 `verification` 连接（DB=10）- 验证码
- 选择 `local` 连接（DB=0）- 认证相关
- 查看缓存 key 和值
- 监控缓存命中率

### 健康检查
```python
from app.core.public_cache_client import public_cache_client
from app.core.usercache_client import usercache_client

# 检查公共缓存连接
if public_cache_client.ping():
    print("公共缓存 Redis 连接正常")

# 检查用户缓存连接
if usercache_client.ping():
    print("用户缓存 Redis 连接正常")
```

## 未来扩展

### 其他用户缓存模块
可以按照地址缓存的模式，创建：
- `OrderCache`：订单缓存
- `ShippingCache`：物流缓存
- `UserProfileCache`：用户资料缓存

### 优化建议
1. **缓存预热**：用户登录后，预加载常用数据到缓存
2. **缓存穿透防护**：缓存空结果，避免频繁查询数据库
3. **缓存雪崩防护**：TTL 添加随机抖动
4. **缓存击穿防护**：使用分布式锁（SETNX）保护热点数据

## 故障处理

### 缓存服务不可用
- 如果 Redis 连接失败，应该降级到直接查询数据库
- 不要因为缓存失败而影响核心功能

### 缓存数据不一致
- 如果发现缓存数据不一致，可以手动删除用户的缓存版本号
- 或者调用 `AddressCache.invalidate_user_addresses(user_id)` 强制失效


