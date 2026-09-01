"""Conversation history CRUD — GET/POST /conversations, DELETE /conversations/{id}"""

import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from backend.routers.auth import get_current_user
from src.db.session import get_session

router = APIRouter(prefix="/conversations", tags=["conversations"])

_MAX_PER_USER = 10


class MessageItem(BaseModel):
    role: str
    content: str


class SaveConversationRequest(BaseModel):
    title: str = "新对话"
    messages: list[MessageItem]


class ConversationSummary(BaseModel):
    id: int
    title: str
    created_at: str
    message_count: int


class ConversationDetail(ConversationSummary):
    messages: list[MessageItem]


@router.post("", response_model=ConversationDetail)
def save_conversation(req: SaveConversationRequest, user: dict = Depends(get_current_user)):
    if not req.messages:
        raise HTTPException(status_code=400, detail="消息列表不能为空")
    session = get_session()
    try:
        # Enforce 10-conversation limit: delete oldest if needed
        rows = session.execute(
            text("SELECT id FROM conversations WHERE user_id = :uid ORDER BY created_at ASC"),
            {"uid": user["id"]},
        ).fetchall()
        if len(rows) >= _MAX_PER_USER:
            oldest_id = rows[0][0]
            session.execute(text("DELETE FROM conversations WHERE id = :id"), {"id": oldest_id})

        messages_json = json.dumps([m.model_dump() for m in req.messages], ensure_ascii=False)
        now = datetime.utcnow()
        session.execute(
            text(
                "INSERT INTO conversations (user_id, title, messages_json, created_at) "
                "VALUES (:uid, :title, :msgs, :t)"
            ),
            {"uid": user["id"], "title": req.title[:80], "msgs": messages_json, "t": now},
        )
        session.commit()
        row = session.execute(
            text("SELECT id FROM conversations WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
            {"uid": user["id"]},
        ).fetchone()
        conv_id = row[0]
        return ConversationDetail(
            id=conv_id,
            title=req.title,
            created_at=now.isoformat(),
            message_count=len(req.messages),
            messages=req.messages,
        )
    finally:
        session.close()


@router.get("", response_model=list[ConversationSummary])
def list_conversations(user: dict = Depends(get_current_user)):
    session = get_session()
    try:
        rows = session.execute(
            text(
                "SELECT id, title, messages_json, created_at FROM conversations "
                "WHERE user_id = :uid ORDER BY created_at DESC LIMIT :lim"
            ),
            {"uid": user["id"], "lim": _MAX_PER_USER},
        ).fetchall()
        result = []
        for row in rows:
            try:
                msgs = json.loads(row[2] or "[]")
            except Exception:
                msgs = []
            result.append(ConversationSummary(
                id=row[0],
                title=row[1] or "对话",
                created_at=str(row[3]),
                message_count=len(msgs),
            ))
        return result
    finally:
        session.close()


@router.get("/{conv_id}", response_model=ConversationDetail)
def get_conversation(conv_id: int, user: dict = Depends(get_current_user)):
    session = get_session()
    try:
        row = session.execute(
            text("SELECT id, title, messages_json, created_at FROM conversations WHERE id = :id AND user_id = :uid"),
            {"id": conv_id, "uid": user["id"]},
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="对话不存在")
        try:
            msgs = [MessageItem(**m) for m in json.loads(row[2] or "[]")]
        except Exception:
            msgs = []
        return ConversationDetail(
            id=row[0], title=row[1] or "对话",
            created_at=str(row[3]), message_count=len(msgs), messages=msgs,
        )
    finally:
        session.close()


@router.delete("/{conv_id}")
def delete_conversation(conv_id: int, user: dict = Depends(get_current_user)):
    session = get_session()
    try:
        row = session.execute(
            text("SELECT id FROM conversations WHERE id = :id AND user_id = :uid"),
            {"id": conv_id, "uid": user["id"]},
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="对话不存在")
        session.execute(text("DELETE FROM conversations WHERE id = :id"), {"id": conv_id})
        session.commit()
        return {"ok": True}
    finally:
        session.close()
