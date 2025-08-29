"""Add users table

Revision ID: e32feabba40f
Revises: 464714074d3c
Create Date: 2025-08-30 00:28:34.726683

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e32feabba40f'
down_revision = '464714074d3c'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username')
    )

def downgrade():
    op.drop_table('users')
