"""SQLAlchemy engine and session factory."""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from config.settings import KNOWLEDGE_BASE_PATH
from src.db.models import Base

_DB_PATH = os.path.join(os.path.dirname(KNOWLEDGE_BASE_PATH), "formulas.db")
_ENGINE = None
_SessionLocal = None


def _get_engine():
    global _ENGINE
    if _ENGINE is None:
        _ENGINE = create_engine(
            f"sqlite:///{_DB_PATH}",
            connect_args={"check_same_thread": False},
        )
    return _ENGINE


def init_db() -> None:
    """Create all tables if they don't exist."""
    Base.metadata.create_all(bind=_get_engine())


def get_session() -> Session:
    """Return a new SQLAlchemy session. Caller is responsible for closing."""
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=_get_engine(), autocommit=False, autoflush=False)
    return _SessionLocal()
