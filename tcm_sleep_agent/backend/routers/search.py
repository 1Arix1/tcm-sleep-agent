"""POST /search — semantic retrieval endpoint."""

from fastapi import APIRouter

from backend.schemas import FormulaItem, SearchRequest, SearchResponse
from src.services.retrieval_service import hybrid_search as retrieval_search

router = APIRouter(tags=["search"])


@router.post("/search", response_model=SearchResponse)
def semantic_search(req: SearchRequest) -> SearchResponse:
    """Perform semantic search over the TCM insomnia knowledge base."""
    raw_results = retrieval_search(req.query, top_k=req.top_k)
    results = [FormulaItem(**item) for item in raw_results]
    return SearchResponse(
        query=req.query,
        top_k=req.top_k,
        results=results,
    )
