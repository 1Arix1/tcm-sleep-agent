"""FastAPI backend entry for TCM Sleep Agent."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.lifespan import lifespan
from backend.routers import analyze as analyze_router
from backend.routers import analyze_stream as analyze_stream_router
from backend.routers import admin as admin_router
from backend.routers import knowledge as knowledge_router
from backend.routers import search as search_router
from backend.routers import auth as auth_router
from backend.routers import conversations as conversations_router

app = FastAPI(
    title="中医失眠处方智能辅助系统 API",
    description="省级大创项目 · RAG + 动态 Few-shot 后端服务",
    version="0.6.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search_router.router)
app.include_router(analyze_router.router)
app.include_router(analyze_stream_router.router)
app.include_router(knowledge_router.router)
app.include_router(admin_router.router)
app.include_router(auth_router.router)
app.include_router(conversations_router.router)


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "tcm-sleep-agent-backend"}
