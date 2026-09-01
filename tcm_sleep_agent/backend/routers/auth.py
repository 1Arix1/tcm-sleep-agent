"""POST /auth/register, POST /auth/login, GET /auth/me"""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from sqlalchemy import text

from src.db.session import get_session

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer = HTTPBearer(auto_error=False)

_SECRET = os.getenv("JWT_SECRET", "tcm-sleep-dev-secret-change-in-prod")
_ALGORITHM = "HS256"
_EXPIRE_DAYS = 7


# ── Schemas ───────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=2, max_length=30, pattern=r"^[a-zA-Z0-9_一-鿿]+$")
    password: str = Field(..., min_length=4, max_length=64)


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    username: str
    user_id: int


class UserInfo(BaseModel):
    id: int
    username: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def _create_token(user_id: int, username: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "username": username, "exp": expire},
        _SECRET,
        algorithm=_ALGORITHM,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未登录")
    try:
        payload = jwt.decode(credentials.credentials, _SECRET, algorithms=[_ALGORITHM])
        return {"id": int(payload["sub"]), "username": payload["username"]}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token 无效或已过期")


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest):
    session = get_session()
    try:
        exists = session.execute(
            text("SELECT id FROM users WHERE username = :u"), {"u": req.username}
        ).fetchone()
        if exists:
            raise HTTPException(status_code=400, detail="用户名已存在")
        hashed = _hash_password(req.password)
        session.execute(
            text("INSERT INTO users (username, password_hash, created_at) VALUES (:u, :h, :t)"),
            {"u": req.username, "h": hashed, "t": datetime.utcnow()},
        )
        session.commit()
        row = session.execute(
            text("SELECT id FROM users WHERE username = :u"), {"u": req.username}
        ).fetchone()
        user_id = row[0]
        return TokenResponse(token=_create_token(user_id, req.username), username=req.username, user_id=user_id)
    finally:
        session.close()


@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    session = get_session()
    try:
        row = session.execute(
            text("SELECT id, password_hash FROM users WHERE username = :u"), {"u": req.username}
        ).fetchone()
        if not row or not _verify_password(req.password, row[1]):
            raise HTTPException(status_code=401, detail="用户名或密码错误")
        return TokenResponse(token=_create_token(row[0], req.username), username=req.username, user_id=row[0])
    finally:
        session.close()


@router.get("/me", response_model=UserInfo)
def me(user: dict = Depends(get_current_user)):
    return UserInfo(id=user["id"], username=user["username"])
