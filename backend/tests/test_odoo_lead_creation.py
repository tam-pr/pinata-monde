"""Tests for create_crm_lead in backend/app/services/odoo.py.

Covers: mock creation (always runs), Odoo-failure handling (always runs,
via monkeypatch — no network), and real Odoo creation (skips unless
ODOO_URL/ODOO_API_KEY are set in backend/.env). Duplicate-approval
idempotency is an app.main.review_quote concern, not create_crm_lead's own
job (see its docstring) — that flow is covered end to end in
tests/test_quotes.py::test_owner_review_keeps_ai_prediction_and_creates_one_mock_odoo_lead.
"""

from __future__ import annotations

from datetime import date, timedelta

import pytest

from app.config import Settings, get_settings
from app.services import odoo as odoo_service
from app.services.odoo import OdooConnectionError, OdooLead, _lead_name, create_crm_lead


class _FakeQuote:
    def __init__(self, **overrides):
        self.id = "test-quote-id"
        self.customer_name = "Ana López"
        self.phone = "3312345678"
        self.email = "ana@example.com"
        self.theme = "Dinosaurio azul"
        self.size = "grande"
        self.quantity = 2
        self.deadline = date.today() + timedelta(days=20)
        self.delivery_method = "pickup"
        self.needs_stick = True
        self.description = "Piñata azul con dinosaurio."
        self.complexity_score = 3
        self.owner_complexity_score = 4
        self.estimated_price_cents = 87500
        self.final_price_cents = 92500
        self.currency = "MXN"
        self.images = []
        for key, value in overrides.items():
            setattr(self, key, value)


def _settings(**overrides) -> Settings:
    base = dict(odoo_mock=True, odoo_url="", odoo_database="", odoo_api_key="")
    base.update(overrides)
    return Settings(**base)


def test_mock_creation_returns_local_lead_without_network_call(monkeypatch):
    captured_payload = {}

    def _fail(*args, **kwargs):
        raise AssertionError("mock mode must never call the Odoo API")

    monkeypatch.setattr(odoo_service, "_json2_call", _fail)
    original_info = odoo_service.logger.info

    def _capture_log(msg, lead_id, payload):
        captured_payload.update(payload)

    monkeypatch.setattr(odoo_service.logger, "info", _capture_log)

    lead = create_crm_lead(quote=_FakeQuote(), settings=_settings(odoo_mock=True))

    assert lead == OdooLead("mock-test-quote-id", "created_mock")
    # Mock and real Odoo must use the same "customer_name_design_name" nomenclature.
    assert captured_payload["name"] == "Ana López_Dinosaurio azul"
    monkeypatch.setattr(odoo_service.logger, "info", original_info)


def test_lead_name_is_customer_underscore_design_and_normalizes_whitespace():
    quote = _FakeQuote(customer_name="  Tamara   Padilla ", theme=" Fluttershy  ")
    assert _lead_name(quote) == "Tamara Padilla_Fluttershy"


def test_lead_name_falls_back_when_theme_missing():
    quote = _FakeQuote(theme=None)
    assert _lead_name(quote) == "Ana López_Sin tema"


def test_odoo_failure_raises_and_never_silently_succeeds(monkeypatch):
    def _raise(*args, **kwargs):
        raise OdooConnectionError("Odoo JSON-2 API error (500): temporary outage")

    monkeypatch.setattr(odoo_service, "_json2_call", _raise)
    settings = _settings(odoo_mock=False, odoo_url="https://example.odoo.com", odoo_api_key="fake-key")

    with pytest.raises(OdooConnectionError):
        create_crm_lead(quote=_FakeQuote(), settings=settings)
    # app.main.review_quote commits the quote's owner_complexity_score/final_price
    # BEFORE calling create_crm_lead, and only writes odoo_lead_id on success, so a
    # raised OdooConnectionError here never loses the quote — re-approving retries.


def test_real_odoo_creation_via_json2():
    """Creates exactly one real crm.lead in the configured Odoo test database
    and verifies it via a READ-ONLY search_read. Skips without real credentials."""
    settings = get_settings()
    if not settings.odoo_url or not settings.odoo_api_key:
        pytest.skip("ODOO_URL/ODOO_API_KEY not set in backend/.env; skipping real Odoo write test.")

    real_settings = Settings(
        odoo_mock=False, odoo_url=settings.odoo_url,
        odoo_database=settings.odoo_database, odoo_api_key=settings.odoo_api_key,
    )
    quote = _FakeQuote(id=f"pytest-{date.today().isoformat()}-{id(object())}")

    lead = create_crm_lead(quote=quote, settings=real_settings)

    assert lead.status == "created"
    assert lead.lead_id

    found = odoo_service._json2_call(
        real_settings, "crm.lead", "search_read",
        {"domain": [["id", "=", int(lead.lead_id)]], "fields": ["id", "name", "contact_name", "phone", "email_from"]},
    )
    assert len(found) == 1
    assert found[0]["contact_name"] == quote.customer_name
    assert found[0]["email_from"] == quote.email
