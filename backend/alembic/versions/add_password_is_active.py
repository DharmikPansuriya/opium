"""add password is_active

Revision ID: add_password_is_active
Revises: merge_heads
Create Date: 2024-03-29 03:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_password_is_active'
down_revision = 'merge_heads'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add is_active column to passwords table
    op.add_column('passwords', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    # Remove is_active column from passwords table
    op.drop_column('passwords', 'is_active') 