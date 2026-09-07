import os

try:
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import declarative_base, sessionmaker

    backend_dir = os.path.dirname(os.path.abspath(__file__))
    DB_FILE = os.path.join(backend_dir, "weathergpt.db")
    DATABASE_URL = f"sqlite+aiosqlite:///{DB_FILE}"

    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    Base = declarative_base()

    async def init_db():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

    async def get_db():
        async with AsyncSessionLocal() as session:
            yield session
except Exception as e:
    # Graceful fallback if async sqlite driver is not yet installed in the current environment
    from sqlalchemy.orm import declarative_base
    try:
        Base = declarative_base()
    except Exception:
        class Base:
            pass

    async def init_db():
        pass

    async def get_db():
        yield None

