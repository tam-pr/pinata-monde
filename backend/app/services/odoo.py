"""Isolated Odoo CRM adapter. Local development uses the idempotent mock."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from xmlrpc.client import ServerProxy

from app.config import Settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class OdooLead:
    lead_id: str
    status: str


def create_crm_lead(*, quote, settings: Settings) -> OdooLead:
    """Create one CRM lead after approval. Caller persists the returned ID."""
    references = ", ".join(image.filename for image in quote.images) or "No reference image"
    payload = {
        "name": f"Piñata Monde quote {quote.id}",
        "contact_name": quote.customer_name,
        "phone": quote.phone,
        "email_from": quote.email,
        "description": (
            f"Folio: {quote.id}\nFinal price: {quote.final_price_cents} {quote.currency} cents\n"
            f"AI complexity: {quote.complexity_score}; owner complexity: {quote.owner_complexity_score}\n"
            f"Delivery: {quote.delivery_method}; deadline: {quote.deadline}\n"
            f"References: {references}\n{quote.description}"
        ),
    }
    if settings.odoo_mock:
        lead_id = f"mock-{quote.id}"
        logger.info("Mock Odoo CRM lead created: %s payload=%s", lead_id, payload)
        return OdooLead(lead_id, "created_mock")

    if not all((settings.odoo_url, settings.odoo_db, settings.odoo_username, settings.odoo_password)):
        raise RuntimeError("Odoo credentials must be configured when ODOO_MOCK=false.")
    common = ServerProxy(f"{settings.odoo_url.rstrip('/')}/xmlrpc/2/common")
    uid = common.authenticate(settings.odoo_db, settings.odoo_username, settings.odoo_password, {})
    if not uid:
        raise RuntimeError("Odoo authentication failed.")
    models = ServerProxy(f"{settings.odoo_url.rstrip('/')}/xmlrpc/2/object")
    lead_id = models.execute_kw(settings.odoo_db, uid, settings.odoo_password, "crm.lead", "create", [payload])
    return OdooLead(str(lead_id), "created")
