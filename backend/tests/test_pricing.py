from datetime import date, timedelta
from decimal import Decimal

import pytest

from app.services.complexity import category_for_score
from app.services.pricing import PricingError, estimate_price

TODAY = date(2026, 8, 30)


def test_placeholder_base_path():
    result = estimate_price(
        size="mediana",
        quantity=1,
        deadline=TODAY + timedelta(days=30),
        shipping=False,
        complexity_score=3,
        as_of=TODAY,
    )
    # 650 * 1.35 = 877.50 (PLACEHOLDER)
    assert result.estimated_price == Decimal("877.50")
    assert result.currency == "MXN"


def test_shipping_and_rush_and_quantity():
    result = estimate_price(
        size="chica",
        quantity=2,
        deadline=TODAY + timedelta(days=3),
        shipping=True,
        complexity_score=1,
        as_of=TODAY,
    )
    # ((400 * 1.00) + 80) * 1.20 * 2 = 1152.00 (PLACEHOLDER)
    assert result.estimated_price == Decimal("1152.00")


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
