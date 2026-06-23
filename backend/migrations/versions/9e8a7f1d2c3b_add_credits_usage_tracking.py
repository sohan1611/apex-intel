"""Add credits and usage tracking

Revision ID: 9e8a7f1d2c3b
Revises: 4a0e81f4d128
Create Date: 2026-06-24 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision: str = '9e8a7f1d2c3b'
down_revision: Union[str, Sequence[str], None] = '4a0e81f4d128'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create usage_tracking table
    op.create_table(
        'usage_tracking',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('analyses_used', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('monthly_reset_date', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    # 2. Migrate existing usage data from subscriptions to usage_tracking
    op.execute(
        """
        INSERT INTO usage_tracking (id, user_id, analyses_used, monthly_reset_date)
        SELECT gen_random_uuid(), user_id, analyses_used, monthly_reset_date
        FROM subscriptions
        """
    )

    # 3. Drop migrated columns from subscriptions
    op.drop_column('subscriptions', 'analyses_used')
    op.drop_column('subscriptions', 'monthly_reset_date')

    # 4. Create analysis_credits table
    op.create_table(
        'analysis_credits',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('purchased_credits', sa.Integer(), nullable=False, server_default='0'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )

    # 5. Create credit_usage_history table
    op.create_table(
        'credit_usage_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('transaction_type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # 1. Add columns back to subscriptions
    op.add_column('subscriptions', sa.Column('monthly_reset_date', sa.DateTime(timezone=True), nullable=True))
    op.add_column('subscriptions', sa.Column('analyses_used', sa.Integer(), nullable=True))

    # 2. Restore data from usage_tracking to subscriptions
    op.execute(
        """
        UPDATE subscriptions s
        SET analyses_used = u.analyses_used,
            monthly_reset_date = u.monthly_reset_date
        FROM usage_tracking u
        WHERE s.user_id = u.user_id
        """
    )

    # Fix nullability after restoring data
    op.alter_column('subscriptions', 'monthly_reset_date', existing_type=sa.DateTime(timezone=True), nullable=False)
    op.alter_column('subscriptions', 'analyses_used', existing_type=sa.Integer(), nullable=False)

    # 3. Drop new tables
    op.drop_table('credit_usage_history')
    op.drop_table('analysis_credits')
    op.drop_table('usage_tracking')
