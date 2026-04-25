"""No-op migration to preserve revision history

Revision ID: 001
Revises: 
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001'
down_revision: Union[str, None] = '0001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # This revision intentionally does nothing. It exists only to avoid
    # duplicate root revisions in historical repositories.
    pass


def downgrade() -> None:
    pass
