"""Pricing engine — independent of classifier implementations.

All monetary amounts are PLACEHOLDER values until Piñata Monde provides real tariffs.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal, ROUND_HALF_UP

# --- PLACEHOLDER tariffs (not real Piñata Monde prices) ---

PLACEHOLDER_BASE_PRICE_BY_SIZE: dict[str, Decimal] = {
    "chica": Decimal("400.00"),
    "mediana": Decimal("650.00"),
    "grande": Decimal("950.00"),
}

PLACEHOLDER_COMPLEXITY_MULTIPLIER: dict[int, Decimal] = {
    1: Decimal("1.00"),
    2: Decimal("1.15"),
    3: Decimal("1.35"),
    4: Decimal("1.60"),
    5: Decimal("1.90"),
}

# Extra per unit when shipping is requested (not pickup).
PLACEHOLDER_SHIPPING_SURCHARGE = Decimal("80.00")

# If deadline is within this many days, apply rush multiplier.
PLACEHOLDER_RUSH_WINDOW_DAYS = 7
PLACEHOLDER_RUSH_MULTIPLIER = Decimal("1.20")

VALID_SIZES = frozenset(PLACEHOLDER_BASE_PRICE_BY_SIZE)
MONEY_QUANTUM = Decimal("0.01")


class PricingError(ValueError):
    """Invalid input to the pricing engine."""


@dataclass(frozen=True)
class PriceEstimate:
    estimated_price: Decimal
    currency: str = "MXN"


def estimate_price(
    *,
    size: str,
    quantity: int,
    deadline: date,
    shipping: bool,
    complexity_score: int,
    as_of: date | None = None,
) -> PriceEstimate:
    """Return a PLACEHOLDER estimate. Does not call or import any classifier."""
    size_key = size.strip().lower()
    if size_key not in VALID_SIZES:
        raise PricingError(f"Unknown size: {size!r}. Expected one of {sorted(VALID_SIZES)}.")
    if quantity < 1:
        raise PricingError("quantity must be >= 1")
    if complexity_score not in PLACEHOLDER_COMPLEXITY_MULTIPLIER:
        raise PricingError("complexity_score must be an integer from 1 to 5")

    today = as_of or date.today()
    if deadline < today:
        raise PricingError("deadline cannot be in the past")

    unit = PLACEHOLDER_BASE_PRICE_BY_SIZE[size_key]
    unit *= PLACEHOLDER_COMPLEXITY_MULTIPLIER[complexity_score]
    if shipping:
        unit += PLACEHOLDER_SHIPPING_SURCHARGE
    if deadline <= today + timedelta(days=PLACEHOLDER_RUSH_WINDOW_DAYS):
        unit *= PLACEHOLDER_RUSH_MULTIPLIER

    total = (unit * quantity).quantize(MONEY_QUANTUM, rounding=ROUND_HALF_UP)
    return PriceEstimate(estimated_price=total)
