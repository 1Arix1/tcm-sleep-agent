"""POST /analyze/stream — SSE streaming version of the RAG pipeline."""

import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from backend.routers.auth import get_current_user
from backend.schemas import AnalyzeRequest
from src.services.fewshot_service import build_fewshot_examples
from src.services.generation_service import generate_analysis_stream
from src.services.query_rewrite_service import rewrite_query
from src.services.retrieval_service import hybrid_search as retrieval_search
from src.services.safety_service import (
    check_safety, check_safety_with_doses,
    extract_herb_dose_pairs, extract_herbs_from_ingredients,
)

router = APIRouter(tags=["analyze"])


@router.post("/analyze/stream")
def analyze_stream(req: AnalyzeRequest, _user: dict = Depends(get_current_user)):
    """Stream pipeline: retrieval + few-shot (sync) → LLM tokens via SSE."""

    def event_stream():
        # Phase 1: query rewrite + retrieval + few-shot (sync)
        rewritten = rewrite_query(req.query)
        retrieved = retrieval_search(rewritten, top_k=req.top_k)
        fewshot = build_fewshot_examples(retrieved)

        # Safety check (十八反/十九畏 + 孕妇禁忌 + 剂量异常)
        all_herbs: list[str] = []
        all_dose_pairs: list[tuple[str, float]] = []
        for item in retrieved:
            ingr = item.get("ingredients", "")
            all_herbs.extend(extract_herbs_from_ingredients(ingr))
            all_dose_pairs.extend(extract_herb_dose_pairs(ingr))
        safety_warnings = check_safety(all_herbs) + check_safety_with_doses(all_dose_pairs)

        # Send metadata event first so frontend can render retrieved/fewshot immediately
        meta = {
            "type": "meta",
            "retrieved": retrieved,
            "fewshot": fewshot,
            "safety_warnings": safety_warnings,
            "rewritten_query": rewritten,
        }
        yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

        # Phase 2: stream LLM tokens (pass history for multi-turn)
        history = [{"role": h.role, "content": h.content} for h in (req.history or [])]
        for chunk in generate_analysis_stream(req.query, retrieved, fewshot, history=history):
            payload = {"type": "token", "content": chunk}
            yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

        # Done signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
