from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from auth import get_current_user
from database import get_db
from models import Booking, Event, User
from schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=List[NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return reminder notifications for the authenticated user."""
    now = datetime.now()
    next_24_hours = now + timedelta(hours=24)

    bookings = (
        db.query(Booking)
        .join(Event, Booking.event_id == Event.id)
        .filter(Booking.user_id == current_user.id)
        .filter(Booking.notification_status.in_(["pending", "sent"]))
        .filter(Event.date > now)
        .filter(Event.date <= next_24_hours)
        .order_by(Event.date.asc())
        .all()
    )

    return [
        {
            "booking_id": booking.id,
            "event_id": booking.event_id,
            "event_name": booking.event.name,
            "event_time": booking.event.date,
            "number_of_tickets": booking.number_of_tickets,
            "scheduled_time": booking.scheduled_time,
            "notification_status": booking.notification_status,
        }
        for booking in bookings
    ]
