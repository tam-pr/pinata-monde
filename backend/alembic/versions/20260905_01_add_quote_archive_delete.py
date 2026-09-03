"""add archived_at and deleted_at to quotes for admin archive/trash

Revision ID: 20260905_01
Revises: 20260904_01
Create Date: 2026-09-05
"""

from alembic import op
import sqlalchemy as sa

revision = "20260905_01"
down_revision = "20260904_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Naive UTC (no timezone=True), matching admin_sessions.expires_at — see
    # app/models.py for why.
    op.add_column("quotes", sa.Column("archived_at", sa.DateTime(), nullable=True))
    op.add_column("quotes", sa.Column("deleted_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("quotes", "deleted_at")
    op.drop_column("quotes", "archived_at")
