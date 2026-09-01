"""Dynamic Few-shot example selection with MMR diversity control."""

from src.services.knowledge_service import get_by_id


def _mmr_select(
    items: list[dict],
    n: int,
    lambda_param: float = 0.7,
) -> list[dict]:
    """Maximum Marginal Relevance selection.

    Args:
        items: Candidates sorted by similarity (descending).
        n: Number of items to select.
        lambda_param: Trade-off between relevance (1.0) and diversity (0.0).
    """
    if len(items) <= n:
        return items

    selected = [items[0]]  # Always pick the most relevant first
    remaining = items[1:]

    while len(selected) < n and remaining:
        best_idx = 0
        best_score = -1.0

        for idx, candidate in enumerate(remaining):
            relevance = candidate["similarity_score"]
            max_dup = max(
                _syndrome_overlap(selected_item, candidate)
                for selected_item in selected
            )
            mmr = lambda_param * relevance - (1 - lambda_param) * max_dup
            if mmr > best_score:
                best_score = mmr
                best_idx = idx

        selected.append(remaining.pop(best_idx))

    return selected


def _syndrome_overlap(a: dict, b: dict) -> float:
    """Return 1.0 if two items share the exact same syndrome name, else 0.0."""
    syn_a = a.get("syndrome", "").strip()
    syn_b = b.get("syndrome", "").strip()
    if not syn_a or not syn_b:
        return 0.0
    return 1.0 if syn_a == syn_b else 0.0


def build_fewshot_examples(retrieved: list[dict]) -> list[dict]:
    """Build dynamic few-shot examples from retrieval results.

    Adaptive strategy:
      - sim >= 0.75 → include up to 3 examples
      - sim >= 0.55 → include up to 2 examples
      - sim >= 0.35 → include 1 example
      - sim < 0.35  → no examples (insufficient match)
    """
    if not retrieved:
        return []

    scored = sorted(retrieved, key=lambda x: x["similarity_score"], reverse=True)

    top_score = scored[0]["similarity_score"]
    if top_score >= 0.75:
        n = min(3, len(scored))
    elif top_score >= 0.55:
        n = min(2, len(scored))
    elif top_score >= 0.35:
        n = 1
    else:
        return []

    # MMR diversity selection
    diverse = _mmr_select(scored, n)

    # Enrich with full example_case from SQLite
    for item in diverse:
        full = get_by_id(item.get("id", ""))
        if full and full.get("example_case"):
            item["example_case"] = full["example_case"]

    # Sort ascending by similarity — least similar first, most similar last (recency effect)
    diverse.sort(key=lambda x: x["similarity_score"])

    return diverse


def format_fewshot_prompt(examples: list[dict]) -> str:
    """Format few-shot examples into a prompt string."""
    if not examples:
        return ""

    parts = ["以下是与当前患者症状相似的参考医案（按相关性排列）：\n"]
    for i, ex in enumerate(examples, 1):
        sim = ex.get("similarity_score", 0)
        parts.append(
            f"【参考医案 {i}｜相似度 {sim:.0%}】\n"
            f"{ex.get('example_case', ex.get('document', ''))}\n"
        )
    parts.append("\n请参考上述医案的分析思路，为当前患者进行辨证论治分析。\n")
    return "\n".join(parts)
