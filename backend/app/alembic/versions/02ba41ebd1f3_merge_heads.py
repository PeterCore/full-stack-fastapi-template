"""merge_heads

Revision ID: 02ba41ebd1f3
Revises: 1a31ce608336, create_teacher_and_role_tables
Create Date: 2025-07-12 20:29:48.333085

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '02ba41ebd1f3'
down_revision = ('1a31ce608336', 'create_teacher_and_role_tables')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
