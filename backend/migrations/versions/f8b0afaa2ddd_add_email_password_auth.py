"""add email password auth

Revision ID: f8b0afaa2ddd
Revises: 9e8a7f1d2c3b
Create Date: 2026-06-24 02:46:21.590712

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f8b0afaa2ddd'
down_revision: Union[str, Sequence[str], None] = '9e8a7f1d2c3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('hashed_password', sa.String(length=255), nullable=True))
    op.alter_column('users', 'google_id', existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('users', 'google_id', existing_type=sa.String(length=255), nullable=False)
    op.drop_column('users', 'hashed_password')
