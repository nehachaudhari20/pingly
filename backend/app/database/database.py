from collections.abc import Generator
from threading import Lock
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pingly.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=Session,
)


class Base(DeclarativeBase):
    pass


_database_initialized = False
_database_initialization_lock = Lock()


def initialize_database() -> None:
    global _database_initialized

    with _database_initialization_lock:
        if _database_initialized:
            return

        from app.models import health_check, website

        Base.metadata.create_all(bind=engine)
        _database_initialized = True


def get_db() -> Generator[Session, None, None]:
    initialize_database()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
