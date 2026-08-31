"""API response models."""

from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


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
    description: str
    complexity_score: int
    complexity_label: str
    estimated_price_cents: int
    currency: str
    status: str
    source: str
    created_at: datetime
    updated_at: datetime
    images: list[QuoteImageResponse]
