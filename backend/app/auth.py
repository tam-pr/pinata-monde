"""Password hashing and cookie-session authentication for /admin.

Deliberately dependency-free (stdlib only — hashlib/hmac/secrets):
* Passwords are hashed with PBKDF2-HMAC-SHA256 (salted, high iteration
  count), never stored or logged in plaintext.
* Sessions are an opaque random token stored server-side (admin_sessions
  table) and referenced by an httpOnly cookie — not a signed/JWT blob — so
  logout and expiry are a plain DB delete/check, no extra crypto dependency.
* The admin user is seeded once from ADMIN_USERNAME/ADMIN_PASSWORD; there is
  no self-registration endpoint and no hardcoded credential anywhere here.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import Settings
from app.db import get_db
from app.models import AdminSession, AdminUser

SESSION_COOKIE_NAME = "admin_session"
SESSION_TTL = timedelta(days=7)
_PBKDF2_ITERATIONS = 600_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_str, salt_hex, hash_hex = stored_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        salt = bytes.fromhex(salt_hex)
        expected = bytes.fromhex(hash_hex)
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations_str))
    return hmac.compare_digest(candidate, expected)


def ensure_admin_seed(db: Session, settings: Settings) -> None:
    """Create the configured admin user if it doesn't exist yet.

    Never overwrites an existing user's password on restart. No-op (and the
    /admin area stays unreachable) if ADMIN_USERNAME/ADMIN_PASSWORD aren't set.
    """
    if not settings.admin_username or not settings.admin_password:
        return
    existing = db.query(AdminUser).filter(AdminUser.username == settings.admin_username).one_or_none()
    if existing is not None:
        return
    db.add(AdminUser(username=settings.admin_username, password_hash=hash_password(settings.admin_password)))
    db.commit()


def authenticate(db: Session, username: str, password: str) -> AdminUser | None:
    user = db.query(AdminUser).filter(AdminUser.username == username).one_or_none()
    if user is None:
        # Still run a hash comparison so failure timing doesn't reveal
        # whether the username exists.
        verify_password(password, hash_password("decoy"))
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_session(db: Session, user: AdminUser) -> str:
    token = secrets.token_urlsafe(32)
    db.add(AdminSession(token=token, user_id=user.id, expires_at=datetime.utcnow() + SESSION_TTL))
    db.commit()
    return token


def delete_session(db: Session, token: str) -> None:
    db.query(AdminSession).filter(AdminSession.token == token).delete()
    db.commit()


def get_current_admin(
    admin_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> AdminUser:
    """FastAPI dependency enforcing a valid admin session. 401s otherwise.

    This — not the frontend's redirect-to-login — is the real access
    boundary: it runs on every protected request regardless of how the
    request was made.
    """
    if not admin_session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado.")
    session = db.query(AdminSession).filter(AdminSession.token == admin_session).one_or_none()
    if session is None or session.expires_at < datetime.utcnow():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión inválida o expirada.")
    user = db.query(AdminUser).filter(AdminUser.id == session.user_id).one_or_none()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado.")
    # Sliding expiration: activity keeps the session alive.
    session.expires_at = datetime.utcnow() + SESSION_TTL
    db.commit()
    return user
