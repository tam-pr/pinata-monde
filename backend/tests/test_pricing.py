from datetime import date, timedelta
from decimal import Decimal

import pytest

from app.services.complexity import category_for_score
from app.services.pricing import PricingError, estimate_price, round_up_to_multiple

TODAY = date(2026, 8, 30)


def test_market_anchor_standard_complexity4_is_700():
    # REAL BUSINESS DATA anchor: Standard (90 cm) + complexity 4/5 = $700 MXN.
    result = estimate_price(
        size="grande",
        quantity=1,
        deadline=TODAY + timedelta(days=30),
        shipping=False,
        complexity_score=4,
        as_of=TODAY,
    )
    assert result.estimated_price == 700
    assert result.currency == "MXN"


def test_placeholder_base_path():
    result = estimate_price(
        size="mediana",
        quantity=1,
        deadline=TODAY + timedelta(days=30),
        shipping=False,
        complexity_score=3,
        as_of=TODAY,
    )
    # 650 (PLACEHOLDER) * 1.35 = 877.50 -> rounded up to next multiple of 5 = 880
    assert result.estimated_price == 880
    assert result.currency == "MXN"


def test_shipping_stick_and_quantity():
    result = estimate_price(
        size="chica",
        quantity=2,
        deadline=TODAY + timedelta(days=30),
        shipping=True,
        complexity_score=1,
        needs_stick=True,
        as_of=TODAY,
    )
    # (400 (PLACEHOLDER) * 1.00 * 2) + 40 (stick) + 150 (shipping) = 990, already a multiple of 5
    assert result.estimated_price == 990


def test_express_is_detected_without_a_fee():
    result = estimate_price(
        size="grande",
        quantity=1,
        deadline=TODAY + timedelta(days=3),
        shipping=False,
        complexity_score=4,
        as_of=TODAY,
    )
    assert result.is_express is True
    assert result.express_fee == Decimal("0.00")
    # No fee invented: still exactly the anchor price.
    assert result.estimated_price == 700

    not_express = estimate_price(
        size="grande",
        quantity=1,
        deadline=TODAY + timedelta(days=6),
        shipping=False,
        complexity_score=4,
        as_of=TODAY,
    )
    assert not_express.is_express is False


def test_final_price_rounds_up_to_next_multiple_of_five():
    assert round_up_to_multiple(Decimal("701"), 5) == 705
    assert round_up_to_multiple(Decimal("703"), 5) == 705
    assert round_up_to_multiple(Decimal("705"), 5) == 705
    assert round_up_to_multiple(Decimal("709"), 5) == 710


def test_rejects_bad_inputs():
    kwargs = dict(
        size="mediana",
        quantity=1,
        deadline=TODAY + timedelta(days=10),
        shipping=False,
        complexity_score=3,
        as_of=TODAY,
    )
    with pytest.raises(PricingError):
        estimate_price(**{**kwargs, "size": "enorme"})
    with pytest.raises(PricingError):
        estimate_price(**{**kwargs, "quantity": 0})
    with pytest.raises(PricingError):
        estimate_price(**{**kwargs, "complexity_score": 6})
    with pytest.raises(PricingError):
        estimate_price(**{**kwargs, "deadline": TODAY - timedelta(days=1)})


def test_complexity_category_mapping():
    assert category_for_score(1) == "simple"
    assert category_for_score(2) == "simple"
    assert category_for_score(3) == "medium"
    assert category_for_score(4) == "complex"
    assert category_for_score(5) == "complex"
    with pytest.raises(ValueError):
        category_for_score(0)
