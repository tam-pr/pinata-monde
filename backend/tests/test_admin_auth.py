"""Tests for /admin authentication (app/auth.py + the admin endpoints).

Verifies the backend itself enforces access — not just the frontend screen —
by hitting the API directly with no session cookie at all.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool

from app.config import get_settings
from app.db import Base
from app.main import app

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "test-admin-password"


@pytest.fixture()
def anon_client(tmp_path, monkeypatch):
    """A TestClient with the admin user seeded but NOT logged in."""
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    monkeypatch.setenv("ADMIN_USERNAME", ADMIN_USERNAME)
    monkeypatch.setenv("ADMIN_PASSWORD", ADMIN_PASSWORD)
    get_settings.cache_clear()
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


def test_admin_quotes_requires_authentication(anon_client: TestClient):
    response = anon_client.get("/admin/quotes")
    assert response.status_code == 401


def test_admin_review_requires_authentication(anon_client: TestClient):
    response = anon_client.patch("/admin/quotes/does-not-matter/review", json={})
    assert response.status_code == 401


def test_price_breakdown_requires_authentication(anon_client: TestClient):
    response = anon_client.get("/quotes/does-not-matter/price-breakdown")
    assert response.status_code == 401


def test_admin_me_requires_authentication(anon_client: TestClient):
    response = anon_client.get("/admin/me")
    assert response.status_code == 401


def test_login_with_correct_credentials_grants_access(anon_client: TestClient):
    login = anon_client.post("/admin/login", json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD})
    assert login.status_code == 200
    assert login.json() == {"username": ADMIN_USERNAME}
    assert "admin_session" in anon_client.cookies

    me = anon_client.get("/admin/me")
    assert me.status_code == 200
    assert me.json() == {"username": ADMIN_USERNAME}

    quotes = anon_client.get("/admin/quotes")
    assert quotes.status_code == 200


def test_login_with_wrong_password_is_rejected(anon_client: TestClient):
    response = anon_client.post("/admin/login", json={"username": ADMIN_USERNAME, "password": "wrong-password"})
    assert response.status_code == 401
    assert "admin_session" not in anon_client.cookies


def test_login_with_unknown_username_is_rejected(anon_client: TestClient):
    response = anon_client.post("/admin/login", json={"username": "someone-else", "password": ADMIN_PASSWORD})
    assert response.status_code == 401


def test_password_is_never_returned_by_login_or_me(anon_client: TestClient):
    login = anon_client.post("/admin/login", json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD})
    assert "password" not in login.text
    assert ADMIN_PASSWORD not in login.text
    me = anon_client.get("/admin/me")
    assert "password" not in me.text


def test_logout_revokes_the_session(anon_client: TestClient):
    login = anon_client.post("/admin/login", json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD})
    assert login.status_code == 200

    logout = anon_client.post("/admin/logout")
    assert logout.status_code == 200

    assert anon_client.get("/admin/me").status_code == 401
    assert anon_client.get("/admin/quotes").status_code == 401


def test_no_admin_user_seeded_without_env_vars(tmp_path, monkeypatch):
    """No ADMIN_USERNAME/ADMIN_PASSWORD -> no user seeded -> /admin stays locked."""
    monkeypatch.setenv("UPLOAD_DIR", str(tmp_path / "uploads"))
    monkeypatch.delenv("ADMIN_USERNAME", raising=False)
    monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
    get_settings.cache_clear()
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    import app.db as db_module

    engine = create_engine("sqlite+pysqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    db_module._engine = engine
    db_module._session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(engine)
    with TestClient(app) as test_client:
        response = test_client.post("/admin/login", json={"username": "admin", "password": "anything"})
        assert response.status_code == 401
    Base.metadata.drop_all(engine)
    get_settings.cache_clear()


def test_password_hashing_never_stores_plaintext():
    from app.auth import hash_password, verify_password

    stored = hash_password("super-secret")
    assert "super-secret" not in stored
    assert stored.startswith("pbkdf2_sha256$")
    assert verify_password("super-secret", stored) is True
    assert verify_password("wrong", stored) is False
