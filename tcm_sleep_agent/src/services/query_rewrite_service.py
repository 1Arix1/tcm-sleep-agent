"""Query rewriting service — normalizes colloquial symptoms to TCM standard terms."""

from openai import OpenAI

from config.settings import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL

_REWRITE_PROMPT = """你是一位中医术语标准化助手。
将患者描述的口语化症状改写为中医标准术语，保留原意，只改写措辞。
常见对照：睡不着→入睡困难，翻来覆去→辗转难眠，心里烦→心烦易怒，
手脚心热→五心烦热，盗汗→盗汗，脑子乱→心神不宁，记性差→健忘，
口渴→口干咽燥，腰酸→腰膝酸软，怕冷→畏寒肢冷，头晕→头晕目眩。
直接输出改写后的文本，不加任何解释或前缀。"""


def rewrite_query(user_input: str) -> str:
    """Rewrite colloquial symptom description to TCM standard terminology.

    Returns the rewritten text, or the original if rewriting fails.
    """
    if not user_input.strip():
        return user_input

    try:
        client = OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)
        response = client.chat.completions.create(
            model=DEEPSEEK_MODEL,
            messages=[
                {"role": "system", "content": _REWRITE_PROMPT},
                {"role": "user", "content": user_input.strip()},
            ],
            temperature=0.1,
            max_tokens=512,
        )
        rewritten = (response.choices[0].message.content or "").strip()
        return rewritten if rewritten else user_input
    except Exception:
        # Fail silently — fall back to original query
        return user_input
