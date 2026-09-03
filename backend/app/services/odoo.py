"""Isolated Odoo CRM adapter. Local development uses the idempotent mock.

ODOO_MOCK=true  -> create_crm_lead returns a local mock lead, no network call.
ODOO_MOCK=false -> create_crm_lead creates one real crm.lead via Odoo's JSON-2
                    API (bearer-token auth), using ODOO_URL/ODOO_DATABASE/ODOO_API_KEY.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import httpx

from app.config import Settings
from app.services.pricing import SIZE_DIMENSIONS_CM

logger = logging.getLogger(__name__)

JSON2_TIMEOUT_SECONDS = 10.0


class OdooConnectionError(RuntimeError):
    """A JSON-2 API call failed. Message never contains the API key."""


def _json2_call(settings: Settings, model: str, method: str, body: dict | None = None) -> object:
    """POST one JSON-2 API call (body keys = the target method's kwarg names).

    Raises OdooConnectionError on failure. Callers decide whether the method
    they pass is read-only or a write — this helper is transport-only.
    """
    url = f"{settings.odoo_url.rstrip('/')}/json/2/{model}/{method}"
    headers = {
        "Authorization": f"bearer {settings.odoo_api_key}",
        "Content-Type": "application/json; charset=utf-8",
    }
    if settings.odoo_database:
        headers["X-Odoo-Database"] = settings.odoo_database
    try:
        response = httpx.post(url, headers=headers, json=body or {}, timeout=JSON2_TIMEOUT_SECONDS)
    except httpx.HTTPError as error:
        # str(error) from httpx does not include headers, so the API key is never leaked.
        raise OdooConnectionError(f"Could not reach {settings.odoo_url}: {error}") from error
    if response.status_code >= 400:
        try:
            detail = response.json()
            message = detail.get("message") or detail.get("name") or response.text
        except ValueError:
            message = response.text
        raise OdooConnectionError(f"Odoo JSON-2 API error ({response.status_code}) on {model}/{method}: {message}")
    return response.json()


def _missing_json2_config(settings: Settings) -> list[str]:
    return [name for name, value in (("ODOO_URL", settings.odoo_url), ("ODOO_API_KEY", settings.odoo_api_key)) if not value]


@dataclass(frozen=True)
class OdooLead:
    lead_id: str
    status: str


def _normalize_lead_name_part(value: str) -> str:
    """Trim and collapse repeated whitespace only — never touches stored data."""
    return " ".join(value.split())


def _lead_name(quote) -> str:
    """`${customer_name}_${design_name}`, e.g. 'Tamara Padilla_Fluttershy'."""
    customer = _normalize_lead_name_part(quote.customer_name or "") or "Cliente"
    design = _normalize_lead_name_part(quote.theme or "") or "Sin tema"
    return f"{customer}_{design}"


def _lead_description(quote, price_estimate) -> str:
    dimension_cm = SIZE_DIMENSIONS_CM.get(quote.size)
    size_label = f"{quote.size} ({dimension_cm} cm)" if dimension_cm else quote.size
    complexity = quote.owner_complexity_score or quote.complexity_score
    is_express = getattr(price_estimate, "is_express", None)
    express_text = "Yes" if is_express else ("No" if is_express is not None else "Unknown")
    references = ", ".join(image.filename for image in quote.images) or "No reference image"
    final_price_cents = quote.final_price_cents if quote.final_price_cents is not None else quote.estimated_price_cents
    return (
        f"Folio: {quote.id}\n"
        f"Final price: {final_price_cents / 100:.2f} {quote.currency}\n"
        f"Complexity: {complexity}/5 (AI suggested {quote.complexity_score}/5)\n"
        f"Size: {size_label}; Quantity: {quote.quantity}\n"
        f"Delivery: {quote.delivery_method}; Requested date: {quote.deadline}\n"
        f"Stick (palo de piñata): {'Yes' if quote.needs_stick else 'No'}\n"
        f"Express (<= {5} days): {express_text}\n"
        f"References: {references}\n\n"
        f"{quote.description}"
    )


def _parse_create_response(result: object) -> str:
    """Defensively parse crm.lead/create's response into a single record id."""
    if isinstance(result, list) and result:
        first = result[0]
        record_id = first.get("id") if isinstance(first, dict) else first
    elif isinstance(result, dict) and "id" in result:
        record_id = result["id"]
    elif isinstance(result, int):
        record_id = result
    else:
        record_id = None
    if record_id is None:
        raise OdooConnectionError(f"Unexpected response from crm.lead/create: {result!r}")
    return str(record_id)


def create_crm_lead(*, quote, settings: Settings, price_estimate=None) -> OdooLead:
    """Create one CRM lead after owner approval. Caller persists the returned ID.

    ODOO_MOCK=true returns an idempotent local mock lead. ODOO_MOCK=false
    creates exactly one real crm.lead via Odoo's JSON-2 API. Callers (see
    app/main.py review_quote) only call this once per quote — when
    quote.odoo_lead_id is not already set — so a repeated approval never
    creates a duplicate lead.
    """
    payload = {
        "name": _lead_name(quote),
        "type": "lead",
        "contact_name": quote.customer_name,
        "phone": quote.phone,
        "email_from": quote.email,
        "date_deadline": quote.deadline.isoformat(),
        "expected_revenue": (quote.final_price_cents if quote.final_price_cents is not None else quote.estimated_price_cents) / 100,
        "description": _lead_description(quote, price_estimate),
    }

    if settings.odoo_mock:
        lead_id = f"mock-{quote.id}"
        logger.info("Mock Odoo CRM lead created: %s payload=%s", lead_id, payload)
        return OdooLead(lead_id, "created_mock")

    missing = _missing_json2_config(settings)
    if missing:
        raise RuntimeError(f"Odoo credentials must be configured when ODOO_MOCK=false. Missing: {', '.join(missing)}.")

    result = _json2_call(settings, "crm.lead", "create", {"vals_list": [payload]})
    lead_id = _parse_create_response(result)
    logger.info("Odoo CRM lead created: id=%s quote=%s", lead_id, quote.id)
    return OdooLead(lead_id, "created")


# ============================================================
# READ-ONLY connectivity diagnostics — Odoo's JSON-2 API
# ============================================================
# These calls MUST NEVER create, write, delete, or archive anything.
# Allowed Odoo ORM methods only: context_get, check_access_rights, fields_get,
# search_read. Used to confirm Piñata Monde can reach the Odoo test database
# and read CRM data independently of lead creation.
# ============================================================


@dataclass(frozen=True)
class OdooDiagnostics:
    connected: bool
    database: str | None
    user_context: dict | None = None
    can_read_leads: bool | None = None
    sample_leads: list[dict] | None = None
    crm_lead_fields: list[str] | None = None
    error: str | None = None


def check_connection_read_only(*, settings: Settings, lead_limit: int = 5) -> OdooDiagnostics:
    """Verify JSON-2 auth and read a few CRM leads/fields. READ-ONLY — never writes.

    Independent of ODOO_MOCK: this only inspects ODOO_URL/ODOO_DATABASE/ODOO_API_KEY,
    so real read connectivity can be verified while lead *creation* stays mocked.
    """
    missing = _missing_json2_config(settings)
    if missing:
        return OdooDiagnostics(
            connected=False,
            database=settings.odoo_database or None,
            error=f"Missing in backend/.env: {', '.join(missing)}.",
        )
    try:
        user_context = _json2_call(settings, "res.users", "context_get")
        can_read_leads = _json2_call(
            settings, "crm.lead", "check_access_rights", {"operation": "read", "raise_exception": False}
        )
        leads = _json2_call(
            settings, "crm.lead", "search_read",
            {"domain": [], "fields": ["id", "name", "create_date"], "limit": lead_limit},
        )
        fields = _json2_call(settings, "crm.lead", "fields_get", {"attributes": ["string", "type"]})
    except OdooConnectionError as error:
        return OdooDiagnostics(connected=False, database=settings.odoo_database or None, error=str(error))

    return OdooDiagnostics(
        connected=True,
        database=settings.odoo_database or None,
        user_context=user_context if isinstance(user_context, dict) else None,
        can_read_leads=bool(can_read_leads),
        sample_leads=leads if isinstance(leads, list) else None,
        crm_lead_fields=sorted(fields.keys()) if isinstance(fields, dict) else None,
    )
