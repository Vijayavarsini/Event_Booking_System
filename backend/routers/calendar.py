from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from auth import get_current_user
from database import get_db
from models import Booking, Event, User
from schemas import CalendarEventResponse

router = APIRouter(tags=["Calendar"])


@router.get("/my-calendar", response_model=List[CalendarEventResponse])
def get_my_calendar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return calendar-ready events booked by the authenticated user only."""
    bookings = (
        db.query(Booking)
        .join(Event, Booking.event_id == Event.id)
        .filter(Booking.user_id == current_user.id)
        .order_by(Event.date.asc())
        .all()
    )

    calendar_events = []
    for booking in bookings:
        event_date = booking.event.date
        calendar_events.append({
            "id": booking.id,
            "title": booking.event.name,
            "start": event_date,
            "end": event_date,
            "description": booking.event.description,
        })

    return calendar_events
