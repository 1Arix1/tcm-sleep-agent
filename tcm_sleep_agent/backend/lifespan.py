"""FastAPI lifespan events — startup/shutdown hooks."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from src.services.knowledge_service import sync_from_json
from src.services.retrieval_service import build_index

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize SQLite + Chroma on startup."""
    logger.info("Backend startup: syncing knowledge base...")
    try:
        sqlite_count = sync_from_json()
        chroma_count = build_index(force_rebuild=False)
        logger.info(
            "Knowledge base ready — SQLite: %d, Chroma: %d",
            sqlite_count,
            chroma_count,
        )
    except Exception as exc:
        logger.error("Knowledge base init failed: %s", exc)
        raise

    yield

    logger.info("Backend shutdown.")
