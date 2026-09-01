"""LLM generation service with RAG + Dynamic Few-shot context injection."""

import os

from openai import OpenAI

from config.settings import DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL


SYSTEM_PROMPT = """你是一个部署在中医失眠智能辅助系统中的 RAG + 动态 Few-shot 处方分析引擎。
本系统是省级大创项目原型，长期目标是与中医院合作，作为智能处方辅助工具部署于科室场景。

你必须遵守以下规则：
1. 参考「相似医案示例」的分析思路和格式，为当前患者进行辨证论治分析。
2. 仅基于检索知识和参考医案提供的内容进行辅助分析，不要编造知识库中没有的方剂。
3. 如果检索结果匹配度低（相似度 < 0.5），请在分析中明确说明"当前知识库检索匹配度较低，以下分析仅供参考"。
4. 不要给出具体药物剂量（克数）。
5. 不要声称可以替代执业医师。
6. 必须包含医疗免责声明。

请按以下结构输出：

## 症状摘要
## 证型判断（附辨证依据）
## 参考方剂（按相似度排序，说明与参考医案的关联）
## 处方分析思路
## 用药注意事项
## 检索证据摘要
## 医疗免责声明
"""


def _get_deepseek_client() -> OpenAI:
    if not DEEPSEEK_API_KEY or DEEPSEEK_API_KEY == "replace_with_your_deepseek_api_key":
        raise RuntimeError("请先在 .env 文件中配置 DEEPSEEK_API_KEY。")
    return OpenAI(api_key=DEEPSEEK_API_KEY, base_url=DEEPSEEK_BASE_URL)


def _format_retrieval_results(items: list[dict]) -> str:
    if not items:
        return "未检索到相关知识。"
    parts = []
    for i, item in enumerate(items, 1):
        parts.append(
            f"【检索条目 {i}｜语义相似度：{item.get('similarity_score', 'N/A'):.0%}】\n"
            f"方剂：{item['name']}\n"
            f"证型：{item['syndrome']}\n"
            f"适用症状：{item['symptoms']}\n"
            f"功效：{item['effects']}\n"
            f"组成：{item['ingredients']}\n"
            f"分类：{item.get('category', '')}\n"
            f"出处：{item.get('source', '')}\n"
            f"注意事项：{item['notes']}\n"
        )
    return "\n".join(parts)


def generate_analysis(
    user_input: str,
    retrieved_items: list[dict] | None = None,
    fewshot_examples: list[dict] | None = None,
) -> str:
    """Generate TCM prescription analysis using DeepSeek with RAG + Dynamic Few-shot.

    Args:
        user_input: Patient symptom description.
        retrieved_items: Semantic search results from retrieval_service.
        fewshot_examples: Dynamically selected few-shot examples.
    """
    cleaned_input = user_input.strip()
    if not cleaned_input:
        raise ValueError("请输入失眠相关症状后再开始分析。")

    knowledge_text = _format_retrieval_results(retrieved_items or [])

    # Build few-shot section
    fewshot_text = ""
    if fewshot_examples:
        from src.services.fewshot_service import format_fewshot_prompt
        fewshot_text = format_fewshot_prompt(fewshot_examples)

    model = os.getenv("DEEPSEEK_MODEL", DEEPSEEK_MODEL)
    client = _get_deepseek_client()

    # Assemble user message
    user_content = f"当前患者主诉失眠相关症状如下：\n{cleaned_input}\n\n"

    if fewshot_text:
        user_content += f"{fewshot_text}\n\n"

    user_content += (
        "以下是从中医失眠知识库中语义检索到的相关方剂知识：\n"
        f"{knowledge_text}\n\n"
        "请基于上述检索内容和参考医案，进行辨证论治分析。"
        "如果检索结果相似度普遍较低（< 0.5），请如实告知用户当前知识库覆盖不足。"
    )

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content or "模型未返回内容。"


def generate_analysis_stream(
    user_input: str,
    retrieved_items: list[dict] | None = None,
    fewshot_examples: list[dict] | None = None,
    history: list[dict] | None = None,
):
    """Streaming version — yields text chunks from DeepSeek.

    Args:
        history: List of {"role": "user"|"assistant", "content": "..."} dicts,
                 max 6 entries (3 turns). Older turns are trimmed by the caller.
    """
    cleaned_input = user_input.strip()
    if not cleaned_input:
        raise ValueError("请输入失眠相关症状后再开始分析。")

    knowledge_text = _format_retrieval_results(retrieved_items or [])

    fewshot_text = ""
    if fewshot_examples:
        from src.services.fewshot_service import format_fewshot_prompt
        fewshot_text = format_fewshot_prompt(fewshot_examples)

    model = os.getenv("DEEPSEEK_MODEL", DEEPSEEK_MODEL)
    client = _get_deepseek_client()

    user_content = f"当前患者主诉失眠相关症状如下：\n{cleaned_input}\n\n"
    if fewshot_text:
        user_content += f"{fewshot_text}\n\n"
    user_content += (
        "以下是从中医失眠知识库中语义检索到的相关方剂知识：\n"
        f"{knowledge_text}\n\n"
        "请基于上述检索内容和参考医案，进行辨证论治分析。"
        "如果检索结果相似度普遍较低（< 0.5），请如实告知用户当前知识库覆盖不足。"
    )

    # Build messages: system + history (max 6 entries) + current user turn
    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        trimmed = history[-6:]  # keep at most 6 entries = 3 turns
        messages.extend({"role": h["role"], "content": h["content"]} for h in trimmed)
    messages.append({"role": "user", "content": user_content})

    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=0.3,
        stream=True,
    )

    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
