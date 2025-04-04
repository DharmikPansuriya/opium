"""initial

Revision ID: bd91b05cfbb0
Revises: 
Create Date: 2025-03-29 18:49:09.309180

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bd91b05cfbb0'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(), nullable=False),
    sa.Column('hashed_password', sa.String(), nullable=False),
    sa.Column('full_name', sa.String(), nullable=True),
    sa.Column('role', sa.Enum('ADMIN', 'USER', name='userrole'), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('is_superuser', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_table('passwords',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('encrypted_password', sa.String(), nullable=False),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('owner_id', sa.Integer(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_passwords_id'), 'passwords', ['id'], unique=False)
    op.create_table('shared_passwords',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('password_id', sa.Integer(), nullable=False),
    sa.Column('shared_with_id', sa.Integer(), nullable=False),
    sa.Column('status', sa.Enum('ACTIVE', 'EXPIRED', 'REVOKED', name='sharestatus'), nullable=True),
    sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('expires_in_hours', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['password_id'], ['passwords.id'], ),
    sa.ForeignKeyConstraint(['shared_with_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_shared_passwords_id'), 'shared_passwords', ['id'], unique=False)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_shared_passwords_id'), table_name='shared_passwords')
    op.drop_table('shared_passwords')
    op.drop_index(op.f('ix_passwords_id'), table_name='passwords')
    op.drop_table('passwords')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    # ### end Alembic commands ###
