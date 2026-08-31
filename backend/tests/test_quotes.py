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
    assert body["complexity_score"] == 3
    assert body["complexity_label"] == "medium"
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
