"""add needs_stick to quotes

Revision ID: 20260903_01
Revises: 20260902_01
Create Date: 2026-09-03
"""

from alembic import op
import sqlalchemy as sa

revision = "20260903_01"
down_revision = "20260902_01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("quotes", sa.Column("needs_stick", sa.Boolean(), nullable=False, server_default=sa.false()))


def downgrade() -> None:
    op.drop_column("quotes", "needs_stick")
