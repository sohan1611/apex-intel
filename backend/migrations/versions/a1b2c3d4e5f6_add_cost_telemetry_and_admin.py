"""Add cost telemetry and admin

Revision ID: a1b2c3d4e5f6
Revises: 9e8a7f1d2c3b
Create Date: 2026-06-24 03:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '9e8a7f1d2c3b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add is_admin column to users
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))

    # 2. Create cost_telemetry table
    op.create_table(
        'cost_telemetry',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('analysis_id', sa.String(length=255), nullable=False),
        sa.Column('subscription_tier', sa.String(length=50), nullable=False),
        sa.Column('model_used', sa.String(length=100), nullable=False),
        sa.Column('pipeline_mode', sa.String(length=50), nullable=False),
        sa.Column('estimated_token_usage', sa.Integer(), nullable=False),
        sa.Column('estimated_cost', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # 1. Drop cost_telemetry table
    op.drop_table('cost_telemetry')

    # 2. Drop is_admin column
    op.drop_column('users', 'is_admin')
