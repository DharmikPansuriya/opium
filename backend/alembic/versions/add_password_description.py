"""add password description

Revision ID: add_password_description
Revises: 
Create Date: 2024-03-29 03:35:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_password_description'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Add description column to passwords table
    op.add_column('passwords', sa.Column('description', sa.String(), nullable=True))

def downgrade() -> None:
    # Remove description column from passwords table
    op.drop_column('passwords', 'description') 