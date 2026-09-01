"""Centralized configuration for the TCM Sleep Agent."""

import os
from dotenv import load_dotenv

load_dotenv()


# -- DeepSeek (LLM Generation) --
DEEPSEEK_API_KEY: str = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_BASE_URL: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com")
DEEPSEEK_MODEL: str = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

# -- DashScope (Embedding) --
DASHSCOPE_API_KEY: str = os.getenv("DASHSCOPE_API_KEY", "")
DASHSCOPE_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
EMBEDDING_MODEL: str = "text-embedding-v4"
EMBEDDING_DIMENSIONS: int = 1024

# -- Chroma Vector Store --
VECTOR_STORE_PATH: str = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "vector_store"
)
COLLECTION_NAME: str = "tcm_insomnia_formulas"

# -- Knowledge Base --
KNOWLEDGE_BASE_PATH: str = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data", "insomnia_formulas.json"
)

# -- Retrieval --
DEFAULT_TOP_K: int = 5

# -- Reranker --
USE_RERANKER: bool = os.getenv("USE_RERANKER", "false").lower() == "true"
RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-base")
RERANKER_CANDIDATE_K: int = 20  # candidates passed to reranker before top_k cut

# -- Backend --
BACKEND_BASE_URL: str = os.getenv("BACKEND_BASE_URL", "http://127.0.0.1:8000")
BACKEND_TIMEOUT: float = float(os.getenv("BACKEND_TIMEOUT", "120.0"))
