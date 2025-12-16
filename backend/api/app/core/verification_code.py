"""
验证码管理（Redis DB 10）
"""
import random
import redis
from typing import Optional
from app.config import settings


class VerificationCodeRedisClient:
    """验证码 Redis 客户端（使用 DB 10）"""
    
    def __init__(self):
        # 如果密码为空字符串或 None，则不传递 password 参数
        redis_kwargs = {
            "host": settings.REDIS_HOST,
            "port": settings.REDIS_PORT,
            "db": 10,  # 验证码专用数据库
            "decode_responses": True,
            "socket_connect_timeout": 5,
            "socket_timeout": 5,
        }
        # 只有当密码存在且非空时才添加 password 参数
        if settings.REDIS_PASSWORD:
            redis_kwargs["password"] = settings.REDIS_PASSWORD
        
        self.client = redis.Redis(**redis_kwargs)
        
        # #region agent debug
        # 测试 Redis 连接
        try:
            ping_result = self.client.ping()
            print(f"[DEBUG INIT] Redis connection test - DB 10, ping: {ping_result}")
            print(f"[DEBUG INIT] Redis config - host: {settings.REDIS_HOST}, port: {settings.REDIS_PORT}, db: 10")
        except Exception as e:
            print(f"[DEBUG INIT] Redis connection failed: {type(e).__name__}: {e}")
        # #endregion
    
    def generate_code(self) -> str:
        """
        生成 6 位数字验证码
        
        Returns:
            6位数字字符串
        """
        return str(random.randint(100000, 999999))
    
    def set_code(self, email: str, code: str, expire_seconds: Optional[int] = None) -> bool:
        """
        存储验证码到 Redis
        
        Args:
            email: 邮箱地址
            code: 验证码
            expire_seconds: 过期时间（秒），默认使用配置值
        
        Returns:
            是否成功
        """
        if expire_seconds is None:
            expire_seconds = settings.VERIFICATION_CODE_EXPIRE_SECONDS
        
        try:
            key = f"verification_code:{email}"
            # #region agent debug
            print(f"[DEBUG SET_CODE] Storing code for email: {email}, code: {code}, key: {key}, expire: {expire_seconds}s")
            # #endregion
            result = self.client.setex(key, expire_seconds, code)
            # #region agent debug
            print(f"[DEBUG SET_CODE] Redis setex result: {result}")
            # 验证存储是否成功
            stored = self.client.get(key)
            print(f"[DEBUG SET_CODE] Verification - stored value: {stored}, match: {stored == code}")
            # #endregion
            return True
        except Exception as e:
            # #region agent debug
            import traceback
            print(f"[DEBUG SET_CODE] Exception: {type(e).__name__}: {e}")
            print(f"[DEBUG SET_CODE] Traceback: {traceback.format_exc()[:200]}")
            # #endregion
            return False
    
    def get_code(self, email: str) -> Optional[str]:
        """
        获取验证码
        
        Args:
            email: 邮箱地址
        
        Returns:
            验证码字符串，如果不存在或已过期则返回 None
        """
        try:
            key = f"verification_code:{email}"
            # #region agent debug
            print(f"[DEBUG GET_CODE] Getting code for email: {email}, key: {key}")
            # #endregion
            code = self.client.get(key)
            # #region agent debug
            print(f"[DEBUG GET_CODE] Retrieved code: {code} (type: {type(code)})")
            # #endregion
            return code
        except Exception as e:
            # #region agent debug
            import traceback
            print(f"[DEBUG GET_CODE] Exception: {type(e).__name__}: {e}")
            print(f"[DEBUG GET_CODE] Traceback: {traceback.format_exc()[:200]}")
            # #endregion
            return None
    
    def verify_code(self, email: str, code: str) -> bool:
        """
        验证验证码
        
        Args:
            email: 邮箱地址
            code: 用户输入的验证码
        
        Returns:
            是否验证成功
        """
        # #region agent debug
        print(f"[DEBUG VERIFY_CODE] Verifying code for email: {email}, input code: {code}")
        # #endregion
        stored_code = self.get_code(email)
        # #region agent debug
        print(f"[DEBUG VERIFY_CODE] Stored code: {stored_code}, input code: {code}, match: {stored_code == code if stored_code else False}")
        # #endregion
        if not stored_code:
            # #region agent debug
            print(f"[DEBUG VERIFY_CODE] No stored code found for email: {email}")
            # #endregion
            return False
        
        # 验证成功后删除验证码（一次性使用）
        if stored_code == code:
            # #region agent debug
            print(f"[DEBUG VERIFY_CODE] Code match! Deleting code...")
            # #endregion
            self.delete_code(email)
            return True
        
        # #region agent debug
        print(f"[DEBUG VERIFY_CODE] Code mismatch: stored='{stored_code}', input='{code}'")
        # #endregion
        return False
    
    def delete_code(self, email: str) -> bool:
        """
        删除验证码
        
        Args:
            email: 邮箱地址
        
        Returns:
            是否成功
        """
        try:
            key = f"verification_code:{email}"
            self.client.delete(key)
            return True
        except Exception:
            return False
    
    def check_rate_limit(self, email: str) -> bool:
        """
        检查发送频率限制（邮箱维度）
        
        Args:
            email: 邮箱地址
        
        Returns:
            True 表示可以发送，False 表示需要等待
        """
        # #region agent debug
        import json
        import os
        log_path = r"c:\Users\mininormi\Desktop\rimsurge\rimsurge-pj\.cursor\debug.log"
        try:
            with open(log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "sessionId": "debug-session",
                    "runId": "run1",
                    "hypothesisId": "A",
                    "location": "verification_code.py:127",
                    "message": "Rate limit check",
                    "data": {
                        "rate_limit_enabled": settings.VERIFICATION_CODE_RATE_LIMIT_ENABLED,
                        "email": email[:20] if email else None
                    },
                    "timestamp": int(__import__("time").time() * 1000)
                }, ensure_ascii=False) + "\n")
        except Exception:
            pass
        # #endregion
        
        # 如果限流被禁用，直接返回 True（用于测试）
        # 处理环境变量可能是字符串的情况
        rate_limit_enabled = getattr(settings, 'VERIFICATION_CODE_RATE_LIMIT_ENABLED', True)
        # #region agent debug
        print(f"[DEBUG EMAIL] VERIFICATION_CODE_RATE_LIMIT_ENABLED type: {type(rate_limit_enabled)}, value: {repr(rate_limit_enabled)}")
        # #endregion
        if isinstance(rate_limit_enabled, str):
            rate_limit_enabled = rate_limit_enabled.lower() in ('true', '1', 'yes', 'on')
            # #region agent debug
            print(f"[DEBUG EMAIL] After string conversion: {rate_limit_enabled}")
            # #endregion
        # #region agent debug
        print(f"[DEBUG EMAIL] Final rate_limit_enabled: {rate_limit_enabled}, will return: {not rate_limit_enabled}")
        # #endregion
        if not rate_limit_enabled:
            # #region agent debug
            try:
                with open(log_path, "a", encoding="utf-8") as f:
                    f.write(json.dumps({
                        "sessionId": "debug-session",
                        "runId": "run1",
                        "hypothesisId": "B",
                        "location": "verification_code.py:145",
                        "message": "Rate limit disabled, returning True",
                        "data": {},
                        "timestamp": int(__import__("time").time() * 1000)
                    }, ensure_ascii=False) + "\n")
            except Exception:
                pass
            # #endregion
            return True
        
        try:
            rate_limit_key = f"verification_code_rate:{email}"
            exists = self.client.exists(rate_limit_key)
            
            if exists:
                # 还在限制期内，不能发送
                return False
            
            # 设置频率限制标记（120秒）
            rate_limit_seconds = settings.VERIFICATION_CODE_RATE_LIMIT_SECONDS
            self.client.setex(rate_limit_key, rate_limit_seconds, "1")
            return True
        except Exception:
            # 如果 Redis 出错，允许发送（避免阻塞）
            return True
    
    def check_ip_rate_limit(self, ip: str) -> bool:
        """
        检查 IP 维度的发送频率限制
        
        Args:
            ip: IP 地址
        
        Returns:
            True 表示可以发送，False 表示需要等待
        """
        # 如果限流被禁用，直接返回 True（用于测试）
        # 处理环境变量可能是字符串的情况
        rate_limit_enabled = getattr(settings, 'VERIFICATION_CODE_RATE_LIMIT_ENABLED', True)
        # #region agent debug
        print(f"[DEBUG IP] VERIFICATION_CODE_RATE_LIMIT_ENABLED type: {type(rate_limit_enabled)}, value: {rate_limit_enabled}")
        # #endregion
        if isinstance(rate_limit_enabled, str):
            rate_limit_enabled = rate_limit_enabled.lower() in ('true', '1', 'yes', 'on')
            # #region agent debug
            print(f"[DEBUG IP] After string conversion: {rate_limit_enabled}")
            # #endregion
        if not rate_limit_enabled:
            # #region agent debug
            print(f"[DEBUG IP] Rate limit disabled, returning True")
            # #endregion
            return True
        
        try:
            rate_limit_key = f"verification_code_rate_ip:{ip}"
            exists = self.client.exists(rate_limit_key)
            
            if exists:
                # 还在限制期内，不能发送
                return False
            
            # 设置频率限制标记（120秒）
            rate_limit_seconds = settings.VERIFICATION_CODE_RATE_LIMIT_SECONDS
            self.client.setex(rate_limit_key, rate_limit_seconds, "1")
            return True
        except Exception:
            # 如果 Redis 出错，允许发送（避免阻塞）
            return True


# 全局验证码 Redis 客户端实例
verification_code_client = VerificationCodeRedisClient()
