"""DashScope embedding service via OpenAI-compatible protocol."""

from openai import OpenAI

from config.settings import (
    DASHSCOPE_API_KEY,
    DASHSCOPE_BASE_URL,
    EMBEDDING_MODEL,
    EMBEDDING_DIMENSIONS,
)


def _get_embedding_client() -> OpenAI:
    if not DASHSCOPE_API_KEY:
        raise RuntimeError("请先在 .env 文件中配置 DASHSCOPE_API_KEY。")
    return OpenAI(api_key=DASHSCOPE_API_KEY, base_url=DASHSCOPE_BASE_URL)


def embed_text(text: str, text_type: str = "document") -> list[float]:
    """Convert a single text into an embedding vector.

    Args:
        text: The text to embed.
        text_type: "query" for user queries, "document" for knowledge base entries.
    """
    client = _get_embedding_client()
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
        dimensions=EMBEDDING_DIMENSIONS,
        extra_body={"text_type": text_type},
    )
    return response.data[0].embedding


def embed_batch(texts: list[str], text_type: str = "document") -> list[list[float]]:
    """Convert multiple texts into embedding vectors.

    The DashScope API supports up to 10 inputs per request.
    """
    if not texts:
        return []
    client = _get_embedding_client()
    # Batch in groups of 10 (API limit)
    all_embeddings = []
    for i in range(0, len(texts), 10):
        batch = texts[i : i + 10]
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=batch,
            dimensions=EMBEDDING_DIMENSIONS,
            extra_body={"text_type": text_type},
        )
        all_embeddings.extend([d.embedding for d in response.data])
    return all_embeddings
