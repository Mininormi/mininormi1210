"""
数据库连接（SQLAlchemy Core）
不使用 ORM 模型，直接使用 Core API
"""
from sqlalchemy import create_engine, MetaData, Table
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
from app.config import settings

# 创建数据库引擎
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # 连接前检查连接是否有效
    echo=settings.DEBUG,  # 调试模式下打印SQL
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 元数据对象（用于表反射）
metadata = MetaData()


def get_db() -> Generator[Session, None, None]:
    """
    数据库会话依赖注入
    使用方式：
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_table(table_name: str) -> Table:
    """
    获取表对象（通过反射）
    使用方式：
        users_table = get_table("fa_user")
        result = db.execute(select(users_table).where(...))
    """
    if table_name not in metadata.tables:
        Table(table_name, metadata, autoload_with=engine)
    return metadata.tables[table_name]

