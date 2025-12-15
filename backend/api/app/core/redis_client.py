"""
Redis 客户端（用于 Refresh Token 管理）
"""
import json
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import redis
from app.config import settings


class RedisClient:
    """Redis 客户端封装"""
    
    def __init__(self):
        self.client = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            db=settings.REDIS_DB,
            decode_responses=settings.REDIS_DECODE_RESPONSES,
            socket_connect_timeout=5,
            socket_timeout=5,
        )
    
    def ping(self) -> bool:
        """检查 Redis 连接"""
        try:
            return self.client.ping()
        except Exception:
            return False
    
    def set_refresh_token(
        self,
        refresh_token: str,
        user_id: int,
        device_id: str,
        device_type: str,
        expire_seconds: Optional[int] = None
    ) -> bool:
        """
        存储 Refresh Token 到 Redis
        
        Args:
            refresh_token: Refresh Token 字符串
            user_id: 用户ID
            device_id: 设备ID
            device_type: 设备类型
            expire_seconds: 过期时间（秒），默认30天
        
        Returns:
            是否成功
        """
        if expire_seconds is None:
            expire_seconds = settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600
        
        expire_time = datetime.utcnow() + timedelta(seconds=expire_seconds)
        
        data = {
            "user_id": user_id,
            "device_id": device_id,
            "device_type": device_type,
            "expire_time": expire_time.timestamp(),
        }
        
        try:
            self.client.setex(
                f"refresh_token:{refresh_token}",
                expire_seconds,
                json.dumps(data)
            )
            return True
        except Exception:
            return False
    
    def get_refresh_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        获取 Refresh Token 信息
        
        Args:
            refresh_token: Refresh Token 字符串
        
        Returns:
            Token 信息字典，如果不存在或已过期则返回 None
        """
        try:
            key = f"refresh_token:{refresh_token}"
            data_str = self.client.get(key)
            
            if not data_str:
                return None
            
            data = json.loads(data_str)
            
            # 检查是否过期
            expire_time = datetime.fromtimestamp(data["expire_time"])
            if datetime.utcnow() > expire_time:
                self.client.delete(key)
                return None
            
            return data
        except Exception:
            return None
    
    def delete_refresh_token(self, refresh_token: str) -> bool:
        """
        删除 Refresh Token
        
        Args:
            refresh_token: Refresh Token 字符串
        
        Returns:
            是否成功
        """
        try:
            self.client.delete(f"refresh_token:{refresh_token}")
            return True
        except Exception:
            return False
    
    def generate_refresh_token(self) -> str:
        """
        生成新的 Refresh Token（UUID）
        
        Returns:
            Refresh Token 字符串
        """
        return str(uuid.uuid4())


# 全局 Redis 客户端实例
redis_client = RedisClient()

