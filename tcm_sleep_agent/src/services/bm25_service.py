"""BM25 sparse retrieval over the SQLite knowledge base."""

from __future__ import annotations

import re
from typing import Optional

from rank_bm25 import BM25Okapi

from src.db.session import init_db
from src.db.crud import get_all_formulas

# Module-level singletons rebuilt when the KB changes
_bm25: Optional[BM25Okapi] = None
_corpus_ids: list[str] = []
_corpus_texts: list[str] = []


def _tokenize(text: str) -> list[str]:
    """Character-level CJK tokenization + ASCII word splitting."""
    tokens: list[str] = []
    # Split on CJK characters (each char is a token) and ASCII words
    for part in re.split(r"([^一-鿿]+)", text):
        if re.fullmatch(r"[^一-鿿]+", part):
            # ASCII region — split on whitespace/punct
            tokens.extend(w.lower() for w in re.split(r"\W+", part) if w)
        else:
            # CJK region — every character is a token
            tokens.extend(list(part))
    return [t for t in tokens if t.strip()]


def _build_document_text(item: dict) -> str:
    """Concatenate searchable fields, weighted by importance."""
    parts = [
        item.get("syndrome", "") * 3,       # triple-weight syndrome
        item.get("symptoms", "") * 2,        # double-weight symptoms
        item.get("effects", ""),
        item.get("ingredients", ""),
        item.get("name", ""),
        item.get("notes", ""),
        item.get("example_case", ""),
    ]
    return " ".join(p for p in parts if p)


def build_bm25_index() -> int:
    """Load all formulas from SQLite and build BM25 index. Returns doc count."""
    global _bm25, _corpus_ids, _corpus_texts

    init_db()
    formulas = get_all_formulas()

    _corpus_ids = [f["id"] for f in formulas]
    _corpus_texts = [_build_document_text(f) for f in formulas]
    tokenized = [_tokenize(t) for t in _corpus_texts]
    _bm25 = BM25Okapi(tokenized)
    return len(_corpus_ids)


def _ensure_index() -> None:
    if _bm25 is None:
        build_bm25_index()


def bm25_search(query: str, top_k: int = 10) -> list[dict]:
    """BM25 search. Returns list of {id, bm25_score, rank}."""
    _ensure_index()
    assert _bm25 is not None

    tokens = _tokenize(query)
    if not tokens:
        return []

    scores = _bm25.get_scores(tokens)

    # Sort descending, keep top_k
    ranked = sorted(
        enumerate(scores), key=lambda x: x[1], reverse=True
    )[:top_k]

    return [
        {"id": _corpus_ids[idx], "bm25_score": float(score), "rank": rank + 1}
        for rank, (idx, score) in enumerate(ranked)
        if score > 0
    ]
