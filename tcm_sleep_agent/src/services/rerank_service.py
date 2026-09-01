"""BGE Cross-encoder reranker for post-retrieval precision ranking.

Enabled via USE_RERANKER=true in .env (off by default to avoid the ~280MB
model download on first run).
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sentence_transformers import CrossEncoder

from config.settings import RERANKER_MODEL

_reranker: "CrossEncoder | None" = None


def get_reranker() -> "CrossEncoder":
    global _reranker
    if _reranker is None:
        from sentence_transformers import CrossEncoder  # deferred import
        _reranker = CrossEncoder(RERANKER_MODEL, max_length=512)
    return _reranker


def rerank(query: str, candidates: list[dict], top_k: int) -> list[dict]:
    """Re-rank candidates using BGE cross-encoder and return top_k.

    Each candidate dict must have at minimum: syndrome, symptoms, ingredients.
    The reranker scores (query, document) pairs where the document is a
    concatenation of the candidate's key fields.
    """
    if not candidates:
        return candidates

    reranker = get_reranker()
    pairs = [
        (
            query,
            f"{c.get('syndrome', '')} {c.get('symptoms', '')} {c.get('ingredients', '')}",
        )
        for c in candidates
    ]
    scores = reranker.predict(pairs)
    ranked = sorted(zip(scores, candidates), key=lambda x: x[0], reverse=True)
    return [c for _, c in ranked[:top_k]]
