"""CRUD operations via SQLAlchemy ORM."""

import json
from typing import Optional

from src.db.models import Formula
from src.db.session import get_session


def get_all_formulas() -> list[dict]:
    """Return all formulas ordered by name."""
    session = get_session()
    try:
        rows = session.query(Formula).order_by(Formula.name).all()
        return [r.to_dict() for r in rows]
    finally:
        session.close()


def get_formula_by_id(formula_id: str) -> Optional[dict]:
    """Return a single formula by ID, or None."""
    session = get_session()
    try:
        row = session.query(Formula).filter(Formula.id == formula_id).first()
        return row.to_dict() if row else None
    finally:
        session.close()


def get_formula_count() -> int:
    """Return total number of formulas."""
    session = get_session()
    try:
        return session.query(Formula).count()
    finally:
        session.close()


def upsert_formula(item: dict) -> None:
    """Insert or replace a formula record."""
    session = get_session()
    try:
        symptoms = item.get("symptoms", [])
        ingredients = item.get("ingredients", [])

        # Handle both list and string formats
        symptoms_str = "、".join(symptoms) if isinstance(symptoms, list) else symptoms
        ingredients_str = "、".join(ingredients) if isinstance(ingredients, list) else ingredients

        existing = session.query(Formula).filter(Formula.id == item["id"]).first()
        if existing:
            existing.name = item["name"]
            existing.syndrome = item["syndrome"]
            existing.symptoms = symptoms_str
            existing.effects = item["effects"]
            existing.ingredients = ingredients_str
            existing.notes = item.get("notes", "")
            existing.category = item.get("category", "")
            existing.source = item.get("source", "演示样例")
            existing.example_case = item.get("example_case", "")
        else:
            session.add(Formula(
                id=item["id"],
                name=item["name"],
                syndrome=item["syndrome"],
                symptoms=symptoms_str,
                effects=item["effects"],
                ingredients=ingredients_str,
                notes=item.get("notes", ""),
                category=item.get("category", ""),
                source=item.get("source", "演示样例"),
                example_case=item.get("example_case", ""),
            ))
        session.commit()
    finally:
        session.close()


def upsert_many(items: list[dict]) -> int:
    """Bulk upsert. Returns count inserted/updated."""
    for item in items:
        upsert_formula(item)
    return len(items)
