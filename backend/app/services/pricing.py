"""Pricing engine — independent of classifier implementations.

Parameters below are grouped and labeled so it is always clear which numbers
are confirmed by the owner versus still awaiting real data:

* REAL BUSINESS DATA   — confirmed directly by the owner.
* MARKET CALIBRATION   — derived from a confirmed real anchor point.
* TODO / PLACEHOLDER   — not yet provided; do not treat as final.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from decimal import ROUND_CEILING, ROUND_HALF_UP, Decimal

# ============================================================
# PIÑATA MONDE BUSINESS PRICING PARAMETERS — EDIT THESE
# ============================================================
# Keep every editable business number in this section. ML and API code
# must never contain business numbers.
# ============================================================

# --- REAL BUSINESS DATA (confirmed by the owner) ---------------------------

SIZE_DIMENSIONS_CM: dict[str, int] = {
    "grande": 90,   # Standard
    "mediana": 60,  # Medium
    "chica": 30,    # Small / Centro de mesa
}

SHIPPING_FEE = Decimal("150.00")  # Flat fee, applied once per quote (not per unit).
STICK_FEE = Decimal("40.00")      # Flat fee ("palo de piñata"), applied once when requested.
EXPRESS_WINDOW_DAYS = 5           # Requested date <= 5 days from the order date is Express.

# --- MARKET CALIBRATION (derived from a confirmed real anchor point) -------
# Anchor: Standard (90 cm) + complexity 4/5 = $700 MXN.
# The complexity multiplier curve is an existing calibration shape; the
# Standard base price is solved from the anchor so that
# BASE_PRICE_BY_SIZE["grande"] * COMPLEXITY_MULTIPLIER[4] == 700.00 exactly.

COMPLEXITY_MULTIPLIER: dict[int, Decimal] = {
    1: Decimal("1.00"),
    2: Decimal("1.15"),
    3: Decimal("1.35"),
    4: Decimal("1.60"),
    5: Decimal("1.90"),
}

_STANDARD_ANCHOR_PRICE = Decimal("700.00")  # Standard (90 cm), complexity 4/5.
BASE_PRICE_STANDARD = _STANDARD_ANCHOR_PRICE / COMPLEXITY_MULTIPLIER[4]  # 437.50

# --- TODO / PLACEHOLDER (not provided by the owner yet) --------------------
# Medium and Small have no confirmed anchor. Do not treat these as real
# business data — replace them once the owner provides real tariffs.
BASE_PRICE_MEDIUM_PLACEHOLDER = Decimal("650.00")
BASE_PRICE_SMALL_PLACEHOLDER = Decimal("400.00")

# The Express fee was not provided by the owner. Express is still detected
# (see EXPRESS_WINDOW_DAYS) so the owner can see it, but $0 is charged for it
# until a real fee exists — do not invent one.
EXPRESS_FEE_PLACEHOLDER = Decimal("0.00")

BASE_PRICE_BY_SIZE: dict[str, Decimal] = {
    "grande": BASE_PRICE_STANDARD,
    "mediana": BASE_PRICE_MEDIUM_PLACEHOLDER,
    "chica": BASE_PRICE_SMALL_PLACEHOLDER,
}

# The final customer-facing price is always an integer (no decimals),
# rounded UP to the next multiple of this value.
# Examples with FINAL_PRICE_ROUNDING = 5: 701->705, 703->705, 705->705, 709->710.
FINAL_PRICE_ROUNDING = 5

VALID_SIZES = frozenset(BASE_PRICE_BY_SIZE)


class PricingError(ValueError):
    """Invalid input to the pricing engine."""


def round_up_to_multiple(value: Decimal, multiple: int) -> int:
    """Round a Decimal amount UP to the next multiple of `multiple`, as an int."""
    if multiple <= 0:
        raise PricingError("FINAL_PRICE_ROUNDING must be a positive integer")
    multiple_dec = Decimal(multiple)
    units = (value / multiple_dec).to_integral_value(rounding=ROUND_CEILING)
    return int(units * multiple_dec)


@dataclass(frozen=True)
class PriceEstimate:
    estimated_price: int  # Final integer MXN price, rounded up to FINAL_PRICE_ROUNDING.
    currency: str = "MXN"
    base_price: Decimal = Decimal("0")
    complexity_multiplier: Decimal = Decimal("1")
    quantity: int = 1
    stick_amount: Decimal = Decimal("0")
    shipping_amount: Decimal = Decimal("0")
    is_express: bool = False
    express_fee: Decimal = Decimal("0")


def estimate_price(
    *,
    size: str,
    quantity: int,
    deadline: date,
    shipping: bool,
    complexity_score: int,
    needs_stick: bool = False,
    as_of: date | None = None,
) -> PriceEstimate:
    """Return the final price. ML never influences this — only the
    owner-approved complexity_score does."""
    size_key = size.strip().lower()
    if size_key not in VALID_SIZES:
        raise PricingError(f"Unknown size: {size!r}. Expected one of {sorted(VALID_SIZES)}.")
    if quantity < 1:
        raise PricingError("quantity must be >= 1")
    if complexity_score not in COMPLEXITY_MULTIPLIER:
        raise PricingError("complexity_score must be an integer from 1 to 5")

    today = as_of or date.today()
    if deadline < today:
        raise PricingError("deadline cannot be in the past")

    base_price = BASE_PRICE_BY_SIZE[size_key]
    complexity_multiplier = COMPLEXITY_MULTIPLIER[complexity_score]
    unit_price = base_price * complexity_multiplier

    stick_amount = STICK_FEE if needs_stick else Decimal("0")
    shipping_amount = SHIPPING_FEE if shipping else Decimal("0")
    is_express = deadline <= today + timedelta(days=EXPRESS_WINDOW_DAYS)
    express_fee = EXPRESS_FEE_PLACEHOLDER if is_express else Decimal("0")

    subtotal = (unit_price * quantity) + stick_amount + shipping_amount + express_fee
    subtotal = subtotal.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    final_price = round_up_to_multiple(subtotal, FINAL_PRICE_ROUNDING)

    return PriceEstimate(
        estimated_price=final_price,
        base_price=base_price,
        complexity_multiplier=complexity_multiplier,
        quantity=quantity,
        stick_amount=stick_amount,
        shipping_amount=shipping_amount,
        is_express=is_express,
        express_fee=express_fee,
    )
