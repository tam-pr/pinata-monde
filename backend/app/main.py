"""FastAPI application for the Phase 4 quote pipeline."""

from __future__ import annotations

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from uuid import uuid4

from fastapi import Cookie, Depends, FastAPI, File, Form, HTTPException, Query, Response, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session, selectinload

from app.auth import (
    SESSION_COOKIE_NAME,
    SESSION_TTL,
    authenticate,
    create_session,
    delete_session,
    ensure_admin_seed,
    get_current_admin,
)
from app.config import get_settings
from app.db import get_db
from app.models import AdminUser, Quote, QuoteImage
from app.schemas import (
    AdminLoginRequest,
    AdminMeResponse,
    PriceBreakdownResponse,
    QuoteResponse,
    QuoteReviewRequest,
)
from app.services.complexity import category_for_score, predict_complexity
from app.services.odoo import create_crm_lead
from app.services.pricing import PricingError, estimate_price

ALLOWED_IMAGE_TYPES = frozenset({"image/jpeg", "image/png", "image/webp"})
VALID_DELIVERY_METHODS = frozenset({"pickup", "shipping"})
VALID_SOURCES = frozenset({"web", "whatsapp"})

app = FastAPI(title="Piñata Monde Quote API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().frontend_origins,
    # Required for the /admin session cookie to be sent cross-origin
    # (frontend and backend run on different ports/origins).
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Content-Type"],
)
app.mount("/uploads", StaticFiles(directory=get_settings().upload_dir, check_dir=False), name="uploads")


@app.on_event("startup")
def _seed_admin_user() -> None:
    db_gen = get_db()
    db = next(db_gen)
    try:
        ensure_admin_seed(db, get_settings())
    finally:
        db_gen.close()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/admin/login", response_model=AdminMeResponse)
def admin_login(payload: AdminLoginRequest, response: Response, db: Session = Depends(get_db)) -> AdminMeResponse:
    user = authenticate(db, payload.username, payload.password)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos.")
    token = create_session(db, user)
    response.set_cookie(
        SESSION_COOKIE_NAME, token,
        httponly=True, samesite="lax", secure=get_settings().secure_cookies,
        max_age=int(SESSION_TTL.total_seconds()), path="/",
    )
    return AdminMeResponse(username=user.username)


@app.post("/admin/logout")
def admin_logout(
    response: Response,
    admin_session: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    if admin_session:
        delete_session(db, admin_session)
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return {"status": "ok"}


@app.get("/admin/me", response_model=AdminMeResponse)
def admin_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminMeResponse:
    return AdminMeResponse(username=current_admin.username)


def _validation_error(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


def _cents(value: Decimal) -> int:
    return int((value * Decimal("100")).quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def _price_for(quote: Quote, complexity_score: int):
    return estimate_price(
        size=quote.size,
        quantity=quote.quantity,
        deadline=quote.deadline,
        shipping=quote.delivery_method == "shipping",
        complexity_score=complexity_score,
        needs_stick=quote.needs_stick,
        # Anchor Express detection to the original order date, not "today"
        # at review time, so the flag doesn't drift while a quote is pending.
        as_of=quote.created_at.date(),
    )


def _breakdown(quote: Quote, complexity_score: int) -> PriceBreakdownResponse:
    estimate = _price_for(quote, complexity_score)
    return PriceBreakdownResponse(
        base_price_cents=_cents(estimate.base_price),
        complexity_score=complexity_score,
        complexity_multiplier=float(estimate.complexity_multiplier),
        quantity=estimate.quantity,
        stick_cents=_cents(estimate.stick_amount),
        shipping_cents=_cents(estimate.shipping_amount),
        is_express=estimate.is_express,
        express_fee_cents=_cents(estimate.express_fee),
        suggested_price_cents=estimate.estimated_price * 100,
        currency=estimate.currency,
    )


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
    needs_stick: bool = Form(False),
    description: str = Form(..., min_length=10),
    theme: str | None = Form(None, max_length=300),
    source: str = Form("web"),
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

    saved_images = await _save_images(images, get_settings().upload_dir)
    try:
        prediction = predict_complexity(
            [item["path"] for item in saved_images], description, backend=get_settings().ml_backend
        )
        score = prediction.complexity_score
        try:
            estimate = estimate_price(
                size=size, quantity=quantity, deadline=deadline, shipping=delivery_method == "shipping",
                complexity_score=score, needs_stick=needs_stick,
            )
        except PricingError as error:
            raise _validation_error(str(error)) from error
        quote = Quote(
            customer_name=customer_name.strip(), phone=phone.strip(), email=email.strip(), theme=theme.strip() if theme else None,
            size=size.strip().lower(), quantity=quantity, deadline=deadline, delivery_method=delivery_method,
            needs_stick=needs_stick,
            description=description.strip(), complexity_score=score, complexity_label=category_for_score(score),
            estimated_price_cents=estimate.estimated_price * 100, ai_confidence=prediction.confidence,
            ai_reason=prediction.reason, ai_model_version=prediction.model_version,
            currency=estimate.currency, status="pending_review", source=source,
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


@app.get("/quotes/{quote_id}/price-breakdown", response_model=PriceBreakdownResponse)
def get_price_breakdown(
    quote_id: str,
    complexity_score: int | None = Query(default=None, ge=1, le=5),
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> PriceBreakdownResponse:
    quote = db.query(Quote).filter(Quote.id == quote_id).one_or_none()
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found.")
    # This preview supports owner review only; it does not change the quote.
    return _breakdown(quote, complexity_score or quote.owner_complexity_score or quote.complexity_score)


@app.get("/admin/quotes", response_model=list[QuoteResponse])
def list_quotes_for_review(db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin)) -> list[Quote]:
    return db.query(Quote).options(selectinload(Quote.images)).order_by(Quote.created_at.desc()).all()


@app.post("/quotes/{quote_id}/whatsapp-click", response_model=QuoteResponse)
def record_whatsapp_click(quote_id: str, db: Session = Depends(get_db)) -> Quote:
    """Record that the customer clicked "Ordenar por WhatsApp" by tagging the
    existing quote's source as WhatsApp — it does not create a new quote, a
    new Odoo lead, or change the quote's pending_review status.

    The click only records intent (the WhatsApp chat opens client-side via a
    plain wa.me link, with no way to confirm the message was sent). The Odoo
    lead is created once, on admin approval (see review_quote), which reads
    this source to tag the lead accordingly — so repeated clicks are a no-op
    beyond the first one.
    """
    quote = db.query(Quote).options(selectinload(Quote.images)).filter(Quote.id == quote_id).one_or_none()
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found.")
    if quote.source != "whatsapp":
        quote.source = "whatsapp"
        db.commit()
        db.refresh(quote)
    return quote


@app.patch("/admin/quotes/{quote_id}/review", response_model=QuoteResponse)
def review_quote(
    quote_id: str, review: QuoteReviewRequest, db: Session = Depends(get_db), _admin: AdminUser = Depends(get_current_admin),
) -> Quote:
    quote = db.query(Quote).options(selectinload(Quote.images)).filter(Quote.id == quote_id).one_or_none()
    if quote is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote not found.")
    if quote.status == "approved" and quote.odoo_lead_id:
        return quote
    if quote.status == "approved":
        # An approved quote with no lead is a recoverable integration retry.
        owner_score = quote.owner_complexity_score or quote.complexity_score
    else:
        owner_score = review.owner_complexity_score or quote.complexity_score

    try:
        suggested = _price_for(quote, owner_score)
    except PricingError as error:
        raise _validation_error(str(error)) from error
    quote.owner_complexity_score = owner_score
    quote.final_price_cents = review.final_price_cents if review.final_price_cents is not None else (quote.final_price_cents or suggested.estimated_price * 100)
    quote.status = "approved"
    try:
        # Persist approval first so an Odoo outage can be retried without losing it.
        db.commit()
        db.refresh(quote)
        if not quote.odoo_lead_id:
            source_label = "WhatsApp" if quote.source == "whatsapp" else "Website"
            lead = create_crm_lead(quote=quote, settings=get_settings(), price_estimate=suggested, source_label=source_label)
            quote.odoo_lead_id = lead.lead_id
            quote.odoo_status = lead.status
        db.commit()
        db.refresh(quote)
        return quote
    except Exception as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Could not create Odoo lead: {error}") from error
