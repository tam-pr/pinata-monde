"""add ML prediction, owner review, and Odoo fields

Revision ID: 20260902_01
Revises: 20260831_01
Create Date: 2026-09-02
"""

from alembic import op
import sqlalchemy as sa

revision = "20260902_01"
down_revision = "20260831_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("quotes", sa.Column("ai_confidence", sa.Float(), nullable=False, server_default="0.3"))
    op.add_column("quotes", sa.Column("ai_reason", sa.Text(), nullable=False, server_default="Pending model prediction."))
    op.add_column("quotes", sa.Column("ai_model_version", sa.String(length=100), nullable=False, server_default="fallback-v1"))
    op.add_column("quotes", sa.Column("owner_complexity_score", sa.Integer(), nullable=True))
    op.add_column("quotes", sa.Column("final_price_cents", sa.Integer(), nullable=True))
    op.add_column("quotes", sa.Column("odoo_lead_id", sa.String(length=100), nullable=True))
    op.add_column("quotes", sa.Column("odoo_status", sa.String(length=30), nullable=True))
    op.create_unique_constraint("uq_quotes_odoo_lead_id", "quotes", ["odoo_lead_id"])
    op.execute("UPDATE quotes SET status = 'pending_review' WHERE status = 'pending'")


def downgrade() -> None:
    op.drop_constraint("uq_quotes_odoo_lead_id", "quotes", type_="unique")
    for column in ("odoo_status", "odoo_lead_id", "final_price_cents", "owner_complexity_score", "ai_model_version", "ai_reason", "ai_confidence"):
        op.drop_column("quotes", column)
