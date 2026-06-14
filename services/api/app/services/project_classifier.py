"""
Classify email subjects/bodies to project codes using keyword matching
from config/projects.yaml.

Returns None if no project matches (unclassified → project 'INT' by fallback).
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Optional
import yaml

from app.config import settings

_registry: list[dict] | None = None


def _load_registry() -> list[dict]:
    global _registry
    if _registry is None:
        path = Path(settings.config_dir) / "projects.yaml"
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f)
        _registry = [p for p in data.get("projects", []) if p.get("active")]
    return _registry


def classify_email(subject: str, body_snippet: str = "", from_addr: str = "") -> Optional[str]:
    """Return project code for best keyword match, or None if unclassified."""
    haystack = f"{subject} {body_snippet} {from_addr}".lower()
    # Normalise — collapse whitespace, strip punctuation for keyword matching
    haystack = re.sub(r"[\r\n\t]+", " ", haystack)

    best_code: Optional[str] = None
    best_score = 0

    for project in _load_registry():
        score = 0
        for kw in project.get("email_keywords", []):
            if kw.lower() in haystack:
                # Exact project code match scores higher
                if kw.upper() == project["code"]:
                    score += 3
                else:
                    score += 1
        if score > best_score:
            best_score = score
            best_code = project["code"]

    return best_code


def reload_registry() -> None:
    """Force reload of projects.yaml (call after config changes)."""
    global _registry
    _registry = None
