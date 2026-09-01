"""POST /admin/rebuild-index — trigger knowledge sync + Chroma rebuild."""

from fastapi import APIRouter

from backend.schemas import RebuildIndexResponse
from src.services.knowledge_service import sync_from_json
from src.services.retrieval_service import build_index

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/rebuild-index", response_model=RebuildIndexResponse)
def rebuild_index() -> RebuildIndexResponse:
    sqlite_count = sync_from_json()
    chroma_count = build_index(force_rebuild=True)
    return RebuildIndexResponse(
        sqlite_count=sqlite_count,
        chroma_count=chroma_count,
        message=f"Rebuild complete — SQLite: {sqlite_count}, Chroma: {chroma_count}",
    )
