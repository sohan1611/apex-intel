"""Merge heads

Revision ID: ac95db2feeab
Revises: a1b2c3d4e5f6, f8b0afaa2ddd
Create Date: 2026-06-24 22:38:32.485195

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ac95db2feeab'
down_revision: Union[str, Sequence[str], None] = ('a1b2c3d4e5f6', 'f8b0afaa2ddd')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
