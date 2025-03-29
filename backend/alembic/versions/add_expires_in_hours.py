"""add expires_in_hours column

Revision ID: add_expires_in_hours
Revises: initial_migration
Create Date: 2024-03-21 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_expires_in_hours'
down_revision = 'initial_migration'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add expires_in_hours column to shared_passwords table
    op.add_column('shared_passwords', sa.Column('expires_in_hours', sa.Integer(), nullable=False))

def downgrade() -> None:
    # Remove expires_in_hours column from shared_passwords table
    op.drop_column('shared_passwords', 'expires_in_hours') 