"""Map internal complexity scores to user-facing categories. Not a classifier."""

from __future__ import annotations

CATEGORIES = ("simple", "medium", "complex")


def category_for_score(complexity_score: int) -> str:
    if complexity_score in (1, 2):
        return "simple"
    if complexity_score == 3:
        return "medium"
    if complexity_score in (4, 5):
        return "complex"
    raise ValueError("complexity_score must be an integer from 1 to 5")
