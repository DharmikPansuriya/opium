"""merge heads

Revision ID: merge_heads
Revises: add_expires_in_hours, add_password_description
Create Date: 2024-03-29 03:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'merge_heads'
down_revision = ('add_expires_in_hours', 'add_password_description')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass 