"""Persistent quote records."""

from __future__ import annotations

from datetime import date, datetime
from uuid import uuid4

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    customer_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    theme: Mapped[str | None] = mapped_column(String(300), nullable=True)
    size: Mapped[str] = mapped_column(String(20), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    deadline: Mapped[date] = mapped_column(Date, nullable=False)
    delivery_method: Mapped[str] = mapped_column(String(20), nullable=False)
    needs_stick: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    complexity_score: Mapped[int] = mapped_column(Integer, nullable=False)
    complexity_label: Mapped[str] = mapped_column(String(20), nullable=False)
    estimated_price_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    ai_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.30)
    ai_reason: Mapped[str] = mapped_column(Text, nullable=False, default="Pending model prediction.")
    ai_model_version: Mapped[str] = mapped_column(String(100), nullable=False, default="fallback-v1")
    owner_complexity_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    final_price_cents: Mapped[int | None] = mapped_column(Integer, nullable=True)
    odoo_lead_id: Mapped[str | None] = mapped_column(String(100), nullable=True, unique=True)
    odoo_status: Mapped[str | None] = mapped_column(String(30), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="MXN")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending_review")
    source: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    images: Mapped[list["QuoteImage"]] = relationship(back_populates="quote", cascade="all, delete-orphan")


class QuoteImage(Base):
    __tablename__ = "quote_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    quote_id: Mapped[str] = mapped_column(ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False, index=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    path: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    quote: Mapped[Quote] = relationship(back_populates="images")


class AdminUser(Base):
    """An established Piñata Monde team member allowed into /admin.

    Seeded from ADMIN_USERNAME/ADMIN_PASSWORD (see app/auth.py); there is no
    self-registration endpoint.
    """

    __tablename__ = "admin_users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    username: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class AdminSession(Base):
    """Server-side session record referenced by an opaque httpOnly cookie.

    A DB-backed token (not a signed/JWT blob) so logout and expiry are a
    plain row check/delete — no extra crypto dependency needed.
    """

    __tablename__ = "admin_sessions"

    token: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("admin_users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    # Naive UTC (no timezone=True): compared directly against datetime.utcnow()
    # in app/auth.py, avoiding SQLite/Postgres tz round-trip inconsistencies.
    expires_at: Mapped[datetime] = mapped_column(DateTime(), nullable=False)
