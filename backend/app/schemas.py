"""API response models."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class QuoteImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    content_type: str
    path: str
    created_at: datetime


class QuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_name: str
    phone: str
    email: str
    theme: str | None
    size: str
    quantity: int
    deadline: date
    delivery_method: str
    needs_stick: bool
    description: str
    complexity_score: int
    complexity_label: str
    estimated_price_cents: int
    ai_confidence: float
    ai_reason: str
    ai_model_version: str
    owner_complexity_score: int | None
    final_price_cents: int | None
    currency: str
    status: str
    source: str
    odoo_lead_id: str | None
    odoo_status: str | None
    created_at: datetime
    updated_at: datetime
    images: list[QuoteImageResponse]


class QuoteReviewRequest(BaseModel):
    owner_complexity_score: int | None = Field(default=None, ge=1, le=5)
    final_price_cents: int | None = Field(default=None, ge=0)


class PriceBreakdownResponse(BaseModel):
    base_price_cents: int
    complexity_score: int
    complexity_multiplier: float
    quantity: int
    stick_cents: int
    shipping_cents: int
    is_express: bool
    express_fee_cents: int
    suggested_price_cents: int
    currency: str


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=200)


class AdminMeResponse(BaseModel):
    """Never includes the password hash or any other secret."""
    username: str
