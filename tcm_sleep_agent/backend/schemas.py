"""Pydantic schemas for request/response validation."""

from pydantic import BaseModel, Field


# ── Request models ─────────────────────────────────
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, description="患者症状描述")
    top_k: int = Field(5, ge=1, le=20, description="返回结果数")


class HistoryMessage(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str


class AnalyzeRequest(BaseModel):
    query: str = Field(..., min_length=1, description="患者症状描述")
    top_k: int = Field(5, ge=1, le=20)
    history: list[HistoryMessage] = Field(default_factory=list, description="对话历史，最多传6条")


# ── Response models ────────────────────────────────
class FormulaItem(BaseModel):
    id: str
    name: str
    syndrome: str
    symptoms: str
    effects: str
    ingredients: str
    notes: str = ""
    category: str = ""
    source: str = ""
    similarity_score: float = 0.0
    hybrid_score: float | None = None
    vector_rank: int | None = None
    bm25_rank: int | None = None


class FewshotItem(FormulaItem):
    example_case: str = ""


class SearchResponse(BaseModel):
    query: str
    top_k: int
    results: list[FormulaItem]


class AnalyzeResponse(BaseModel):
    query: str
    retrieved: list[FormulaItem]
    fewshot: list[FewshotItem]
    analysis: str
    pipeline_steps: list[str]
    safety_warnings: list[str] = []


class KnowledgeCountResponse(BaseModel):
    sqlite_count: int
    chroma_count: int


class RebuildIndexResponse(BaseModel):
    sqlite_count: int
    chroma_count: int
    message: str
