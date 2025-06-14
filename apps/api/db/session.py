from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import ssl
from core.config import settings

# Create SSL context for Neon
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    settings.DATABASE_URI.split("?")[0], 
    echo=True,
    pool_pre_ping=True,
    pool_size=20,
    max_overflow=0,
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "ssl": ssl_context,
        "server_settings": {
            "application_name": "fastapi_app",
        }
    }
)

AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    future=True
)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session