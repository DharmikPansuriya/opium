"""add username to passwords

Revision ID: b6aa165a2f59
Revises: add_password_is_active
Create Date: 2024-03-29 04:30:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b6aa165a2f59'
down_revision = 'add_password_is_active'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add username column to passwords table with a default value
    op.add_column('passwords', sa.Column('username', sa.String(), nullable=True))
    # Update existing rows to have a default username
    op.execute("UPDATE passwords SET username = title WHERE username IS NULL")
    # Make the column non-nullable
    op.alter_column('passwords', 'username', nullable=False)


def downgrade() -> None:
    # Remove username column from passwords table
    op.drop_column('passwords', 'username') 