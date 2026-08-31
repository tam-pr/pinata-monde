"""FastAPI application for the Phase 4 quote pipeline."""

from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from uuid import uuid4

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, selectinload

from app.config import get_settings
from app.db import get_db
from app.models import Quote, QuoteImage
from app.schemas import QuoteResponse
from app.services.complexity import category_for_score
from app.services.pricing import PricingError, estimate_price

ALLOWED_IMAGE_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})
VALID_DELIVERY_METHODS = frozenset({"pickup", "shipping"})
VALID_SOURCES = frozenset({"web", "whatsapp"})
DEFAULT_COMPLEXITY_SCORE = 3

app = FastAPI(title="Piñata Monde Quote API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[get_settings().frontend_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _validation_error(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


async def _save_images(images: list[UploadFile], upload_dir: Path) -> list[dict[str, str]]:
    settings = get_settings()
    if len(images) > settings.max_images_per_quote:
        raise _validation_error(f"A maximum of {settings.max_images_per_quote} images is allowed.")

    upload_dir.mkdir(parents=True, exist_ok=True)
    saved: list[dict[str, str]] = []
    try:
        for image in images:
            if image.content_type not in ALLOWED_IMAGE_TYPES:
                raise _validation_error("Images must be JPEG, PNG, or WebP.")
            contents = await image.read()
            if len(contents) > settings.max_image_bytes:
                raise _validation_error(f"Each image must be at most {settings.max_image_bytes} bytes.")
            suffix = Path(image.filename or "upload").suffix.lower()
            stored_name = f"{uuid4()}{suffix}"
            stored_path = upload_dir / stored_name
            stored_path.write_bytes(contents)
            saved.append({
                "filename": image.filename or "upload",
                "content_type": image.content_type,
                "path": str(stored_path),
            })
    except Exception:
        for item in saved:
            Path(item["path"]).unlink(missing_ok=True)
        raise
    finally:
        for image in images:
            await image.close()
    return saved


@app.post("/quotes", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
async def create_quote(
    customer_name: str = Form(..., min_length=2, max_length=200),
    phone: str = Form(..., min_length=8, max_length=50),
    email: str = Form(..., min_length=3, max_length=320),
    size: str = Form(...),
    quantity: int = Form(..., ge=1),
    deadline: date = Form(...),
    delivery_method: str = Form(...),
    description: str = Form(..., min_length=10),
    theme: str | None = Form(None, max_length=300),
    source: str = Form("web"),
    complexity_score: int | None = Form(None, ge=1, le=5),
    images: list[UploadFile] = File(default=[]),
    db: Session = Depends(get_db),
) -> Quote:
    if delivery_method not in VALID_DELIVERY_METHODS:
        raise _validation_error("delivery_method must be pickup or shipping.")
    if source not in VALID_SOURCES:
        raise _validation_error("source must be web or whatsapp.")
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise _validation_error("email must be valid.")
    if deadline < date.today():
        raise _validation_error("deadline cannot be in the past.")

    score = complexity_score or DEFAULT_COMPLEXITY_SCORE
    try:
        estimate = estimate_price(size=size, quantity=quantity, deadline=deadline, shipping=delivery_method == "shipping", complexity_score=score)
    except PricingError as error:
        raise _validation_error(str(error)) from error

    saved_images = await _save_images(images, get_settings().upload_dir)
    try:
        quote = Quote(
            customer_name=customer_name.strip(), phone=phone.strip(), email=email.strip(), theme=theme.strip() if theme else None,
            size=size.strip().lower(), quantity=quantity, deadline=deadline, delivery_method=delivery_method,
            description=description.strip(), complexity_score=score, complexity_label=category_for_score(score),
            estimated_price_cents=int((estimate.estimated_price * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP)),
            currency=estimate.currency, status="pending", source=source,
        )
        quote.images = [QuoteImage(**item) for item in saved_images]
        db.add(quote)
        db.commit()
        db.refresh(quote)
        return quote
    except Exception:
        db.rollback()
        for item in saved_images:
            Path(item["path"]).unlink(missing_ok=True)
        raise


@app.get("/quotes/{quote_id}", response_model=QuoteResponse)
def get_quote(quote_id: str, db: Session = Depends(get_db)) -> Quote:
    quote = db.query(Quote).options(selectinload(Quote.images)).filter(Quote.id == quote_id).one_or_none()
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found.")
    return quote
