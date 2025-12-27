"""
公共缓存 Redis 客户端（DB=1）
用于缓存 Web 和小程序游客可访问的公共数据：品牌列表、车型数据、商品筛选条件等
"""
import json
import redis
from typing import Optional, Dict, Any, List
from app.config import settings


class PublicCacheClient:
    """公共缓存 Redis 客户端（DB=1）"""
    
    def __init__(self):
        redis_kwargs = {
            "host": settings.REDIS_HOST,
            "port": settings.REDIS_PORT,
            "db": settings.REDIS_PUBLIC_DB,  # DB=1 专门用于公共缓存
            "decode_responses": settings.REDIS_DECODE_RESPONSES,
            "socket_connect_timeout": 5,
            "socket_timeout": 5,
        }
        if settings.REDIS_PASSWORD:
            redis_kwargs["password"] = settings.REDIS_PASSWORD
        
        self.client = redis.Redis(**redis_kwargs)
        self.default_ttl = settings.REDIS_PUBLIC_TTL
    
    def ping(self) -> bool:
        """检查 Redis 连接"""
        try:
            return self.client.ping()
        except Exception:
            return False
    
    def get(self, key: str) -> Optional[str]:
        """
        获取缓存值
        
        Args:
            key: 缓存键
            
        Returns:
            缓存值（字符串），如果不存在返回 None
        """
        try:
            return self.client.get(key)
        except Exception:
            return None
    
    def set(self, key: str, value: str, ttl: Optional[int] = None) -> bool:
        """
        设置缓存值
        
        Args:
            key: 缓存键
            value: 缓存值（字符串）
            ttl: 过期时间（秒），None 使用默认TTL
            
        Returns:
            是否成功
        """
        try:
            if ttl is None:
                ttl = self.default_ttl
            self.client.setex(key, ttl, value)
            return True
        except Exception:
            return False
    
    def delete(self, *keys: str) -> int:
        """
        删除缓存键
        
        Args:
            *keys: 要删除的键（可变参数）
            
        Returns:
            删除的键数量
        """
        try:
            if not keys:
                return 0
            return self.client.delete(*keys)
        except Exception:
            return 0
    
    def delete_pattern(self, pattern: str) -> int:
        """
        按模式删除缓存键（使用 SCAN 避免阻塞）
        
        Args:
            pattern: 键模式（如 "publiccache:brands:*"）
            
        Returns:
            删除的键数量
        """
        try:
            deleted_count = 0
            cursor = 0
            while True:
                cursor, keys = self.client.scan(cursor, match=pattern, count=100)
                if keys:
                    deleted_count += self.client.delete(*keys)
                if cursor == 0:
                    break
            return deleted_count
        except Exception:
            return 0
    
    def exists(self, key: str) -> bool:
        """
        检查键是否存在
        
        Args:
            key: 缓存键
            
        Returns:
            是否存在
        """
        try:
            return self.client.exists(key) > 0
        except Exception:
            return False
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """
        递增键的值（用于版本号）
        
        Args:
            key: 缓存键
            amount: 递增数量
            
        Returns:
            递增后的值，失败返回 None
        """
        try:
            return self.client.incrby(key, amount)
        except Exception:
            return None
    
    def get_version(self, cache_type: str) -> int:
        """
        获取公共缓存版本号（用于批量失效）
        
        Args:
            cache_type: 缓存类型（如 "brands", "vehicles"）
            
        Returns:
            版本号（从1开始）
        """
        key = f"publiccache:{cache_type}:ver"
        version = self.client.get(key)
        if version is None:
            # 初始化版本号
            self.client.set(key, "1", ex=86400 * 7)  # 7天过期
            return 1
        return int(version)
    
    def bump_version(self, cache_type: str) -> int:
        """
        递增公共缓存版本号（用于批量失效所有相关缓存）
        
        Args:
            cache_type: 缓存类型（如 "brands", "vehicles"）
            
        Returns:
            新的版本号
        """
        key = f"publiccache:{cache_type}:ver"
        try:
            new_version = self.client.incr(key)
            self.client.expire(key, 86400 * 7)  # 7天过期
            return new_version
        except Exception:
            # 如果失败，返回1
            self.client.set(key, "1", ex=86400 * 7)
            return 1


# 全局公共缓存客户端实例
public_cache_client = PublicCacheClient()

