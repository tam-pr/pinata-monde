from __future__ import annotations

from datetime import date, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool

from app.config import get_settings
from app.db import Base
from app.main import app


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    get_settings.cache_clear()
    # SQLite in-memory requests must share the same connection.
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    import app.db as db_module

    engine = create_engine("sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    db_module._engine = engine
    db_module._session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(engine)
    get_settings.cache_clear()


def quote_payload() -> dict[str, str]:
    return {
        "customer_name": "Ana López",
        "phone": "3312345678",
        "email": "ana@example.com",
        "theme": "Dinosaurio azul",
        "size": "mediana",
        "quantity": "2",
        "deadline": (date.today() + timedelta(days=14)).isoformat(),
        "delivery_method": "pickup",
        "description": "Quiero una piñata azul con detalles de dinosaurio.",
        "source": "web",
    }


def test_create_quote_uses_pricing_engine(client: TestClient):
    response = client.post("/quotes", data=quote_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["complexity_score"] == 3  # no image uses the ML fallback
    assert body["complexity_label"] == "medium"
    assert body["ai_model_version"] == "fallback-v1"
    assert 0 <= body["ai_confidence"] <= 1
    assert body["estimated_price_cents"] == 175500
    assert body["currency"] == "MXN"
    assert body["source"] == "web"


def test_get_quote_returns_saved_record_and_images(client: TestClient):
    created = client.post("/quotes", data=quote_payload(), files=[("images", ("idea.png", b"image", "image/png"))])
    assert created.status_code == 201
    quote_id = created.json()["id"]

    response = client.get(f"/quotes/{quote_id}")
    assert response.status_code == 200
    assert response.json()["id"] == quote_id
    assert response.json()["images"][0]["filename"] == "idea.png"


@pytest.mark.parametrize(
    ("data", "files"),
    [
        ({"customer_name": ""}, []),
        ({"email": "not-an-email"}, []),
        ({"size": "extra-grande"}, []),
        ({}, [("images", ("idea.gif", b"image", "image/gif"))]),
        ({}, [("images", (f"{index}.png", b"image", "image/png")) for index in range(4)]),
        ({}, [("images", ("big.png", b"x" * (5 * 1024 * 1024 + 1), "image/png"))]),
    ],
)
def test_quote_validation(client: TestClient, data: dict[str, str], files):
    payload = quote_payload() | data
    response = client.post("/quotes", data=payload, files=files)
    assert response.status_code == 422


def test_missing_quote_returns_404(client: TestClient):
    response = client.get("/quotes/not-a-quote")
    assert response.status_code == 404


def test_owner_review_keeps_ai_prediction_and_creates_one_mock_odoo_lead(client: TestClient):
    created = client.post("/quotes", data=quote_payload(), files=[("images", ("idea.png", b"reference-image", "image/png"))])
    assert created.status_code == 201
    original = created.json()

    reviewed = client.patch(
        f"/admin/quotes/{original['id']}/review",
        json={"owner_complexity_score": 3, "final_price_cents": 210000},
    )
    assert reviewed.status_code == 200
    body = reviewed.json()
    assert body["status"] == "approved"
    assert body["owner_complexity_score"] == 3
    assert body["final_price_cents"] == 210000
    assert body["complexity_score"] == original["complexity_score"]
    assert body["odoo_lead_id"] == f"mock-{original['id']}"

    retry = client.patch(f"/admin/quotes/{original['id']}/review", json={})
    assert retry.status_code == 200
    assert retry.json()["odoo_lead_id"] == body["odoo_lead_id"]


def test_price_breakdown_is_available_before_review(client: TestClient):
    created = client.post("/quotes", data=quote_payload())
    response = client.get(f"/quotes/{created.json()['id']}/price-breakdown")
    assert response.status_code == 200
    body = response.json()
    assert body["complexity_score"] == created.json()["complexity_score"]
    assert body["suggested_price_cents"] == created.json()["estimated_price_cents"]


def test_price_breakdown_previews_an_owner_complexity_without_changing_quote(client: TestClient):
    created = client.post("/quotes", data=quote_payload())
    quote_id = created.json()["id"]
    original = client.get(f"/quotes/{quote_id}").json()
    preview = client.get(f"/quotes/{quote_id}/price-breakdown?complexity_score=5").json()
    assert preview["complexity_score"] == 5
    assert preview["suggested_price_cents"] > original["estimated_price_cents"]
    assert client.get(f"/quotes/{quote_id}").json()["complexity_score"] == original["complexity_score"]
