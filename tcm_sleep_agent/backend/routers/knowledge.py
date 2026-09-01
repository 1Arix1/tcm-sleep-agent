"""GET /knowledge/* — read-only knowledge base endpoints."""

from fastapi import APIRouter, HTTPException

from backend.schemas import KnowledgeCountResponse
from src.services.knowledge_service import get_by_id, get_count, list_all
from src.services.retrieval_service import _get_collection

router = APIRouter(prefix="/knowledge", tags=["knowledge"])


@router.get("/count", response_model=KnowledgeCountResponse)
def knowledge_count() -> KnowledgeCountResponse:
    sqlite_count = get_count()
    chroma_count = _get_collection().count()
    return KnowledgeCountResponse(
        sqlite_count=sqlite_count,
        chroma_count=chroma_count,
    )


@router.get("/list")
def knowledge_list() -> list[dict]:
    return list_all()


@router.get("/{formula_id}")
def knowledge_detail(formula_id: str) -> dict:
    item = get_by_id(formula_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Formula not found: {formula_id}")
    return item
