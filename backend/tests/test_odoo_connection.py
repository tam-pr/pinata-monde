"""READ-ONLY Odoo JSON-2 connectivity check.

This test never creates, updates, deletes, or archives Odoo records. It only
calls context_get, check_access_rights, search_read, and fields_get.

It is skipped unless ODOO_URL and ODOO_API_KEY are set in backend/.env
(ODOO_DATABASE too, for multi-database instances), so it never runs against
a real system by accident.
"""

from __future__ import annotations

import pytest

from app.config import get_settings
from app.services.odoo import check_connection_read_only


def test_odoo_read_only_connection():
    settings = get_settings()
    if not settings.odoo_url or not settings.odoo_api_key:
        pytest.skip(
            "ODOO_URL/ODOO_API_KEY not set in backend/.env; "
            "skipping the real read-only Odoo connectivity check."
        )

    result = check_connection_read_only(settings=settings)

    assert result.connected, result.error
    assert result.can_read_leads is True
    assert result.sample_leads is not None
    assert result.crm_lead_fields is not None
