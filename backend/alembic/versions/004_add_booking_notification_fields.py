"""Add booking notification metadata columns

Revision ID: 004_add_booking_notification_fields
Revises: 003_add_number_of_tickets_to_bookings
Create Date: 2026-04-25 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "004_add_booking_notification_fields"
down_revision: Union[str, None] = "003_add_number_of_tickets_to_bookings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("bookings", schema=None) as batch_op:
        batch_op.add_column(
            sa.Column("notification_status", sa.String(), nullable=False, server_default="pending")
        )
        batch_op.add_column(sa.Column("scheduled_time", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("notification_job_id", sa.String(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table("bookings", schema=None) as batch_op:
        batch_op.drop_column("notification_job_id")
        batch_op.drop_column("scheduled_time")
        batch_op.drop_column("notification_status")
