"""POST /analyze — full RAG + Dynamic Few-shot pipeline endpoint."""

from fastapi import APIRouter, Depends, HTTPException

from backend.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    FewshotItem,
    FormulaItem,
)
from backend.routers.auth import get_current_user
from src.services.fewshot_service import build_fewshot_examples
from src.services.generation_service import generate_analysis
from src.services.query_rewrite_service import rewrite_query
from src.services.retrieval_service import hybrid_search as retrieval_search
from src.services.safety_service import (
    check_safety, check_safety_with_doses,
    extract_herb_dose_pairs, extract_herbs_from_ingredients,
)

router = APIRouter(tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest, _user: dict = Depends(get_current_user)) -> AnalyzeResponse:
    """Full pipeline: retrieval → dynamic few-shot → LLM generation → safety check."""
    try:
        rewritten_query = rewrite_query(req.query)
        retrieved = retrieval_search(rewritten_query, top_k=req.top_k)
        fewshot = build_fewshot_examples(retrieved)
        analysis = generate_analysis(req.query, retrieved, fewshot)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Collect all herbs from top retrieved formulas and run safety check
    all_herbs: list[str] = []
    all_dose_pairs: list[tuple[str, float]] = []
    for item in retrieved:
        ingr = item.get("ingredients", "")
        all_herbs.extend(extract_herbs_from_ingredients(ingr))
        all_dose_pairs.extend(extract_herb_dose_pairs(ingr))
    safety_warnings = check_safety(all_herbs) + check_safety_with_doses(all_dose_pairs)

    pipeline_steps = [
        "症状输入 → 文本预处理",
        "通义千问 text-embedding-v4 语义向量编码",
        f"BM25 稀疏检索 + Chroma 向量检索 → RRF 融合 Top {req.top_k}",
        f"动态 Few-shot 构建 → MMR 多样性选取 {len(fewshot)} 条参考医案",
        "DeepSeek 基于参考医案 + 检索知识生成结构化处方分析",
        f"配伍安全检查 → {'发现 ' + str(len(safety_warnings)) + ' 条警告' if safety_warnings else '未发现配伍禁忌'}",
    ]

    return AnalyzeResponse(
        query=req.query,
        retrieved=[FormulaItem(**item) for item in retrieved],
        fewshot=[FewshotItem(**item) for item in fewshot],
        analysis=analysis,
        pipeline_steps=pipeline_steps,
        safety_warnings=safety_warnings,
    )
