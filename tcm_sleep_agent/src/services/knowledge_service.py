"""Knowledge management — SQLAlchemy ORM backed."""

import json

from config.settings import KNOWLEDGE_BASE_PATH
from src.db.session import init_db
from src.db.crud import (
    get_all_formulas,
    get_formula_by_id,
    get_formula_count,
    upsert_many,
)


def sync_from_json() -> int:
    """Sync knowledge from JSON file into SQLite via ORM. Returns count."""
    init_db()
    with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as f:
        formulas = json.load(f)
    return upsert_many(formulas)


def list_all() -> list[dict]:
    """Return all formulas as dicts."""
    init_db()
    return get_all_formulas()


def get_by_id(formula_id: str) -> dict | None:
    """Get a single formula by ID."""
    init_db()
    return get_formula_by_id(formula_id)


def get_count() -> int:
    """Return total count of formulas."""
    init_db()
    return get_formula_count()
