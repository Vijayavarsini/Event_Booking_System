"""Add number_of_tickets column to bookings

Revision ID: 003_add_number_of_tickets_to_bookings
Revises: 002_add_users_and_booking_user_id
Create Date: 2026-04-25 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "003_add_number_of_tickets_to_bookings"
down_revision: Union[str, None] = "002_add_users_and_booking_user_id"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("bookings", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("number_of_tickets", sa.Integer(), nullable=False, server_default="1")
        )


def downgrade() -> None:
    with op.batch_alter_table("bookings", schema=None) as batch_op:
        batch_op.drop_column("number_of_tickets")
