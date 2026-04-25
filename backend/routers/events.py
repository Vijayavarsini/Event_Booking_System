from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from typing import Optional
from auth import get_current_user
from database import get_db
from models import Event, Booking, User
from notification_scheduler import schedule_booking_notification
from schemas import EventCreate, EventResponse, BookingResponse, BookEventRequest
from websocket_manager import manager

router = APIRouter(prefix="/events", tags=["Events"])


@router.post("/", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new event."""
    db_event = Event(
        name=event.name,
        description=event.description,
        total_seats=event.total_seats,
        available_seats=event.total_seats,
        date=event.date,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.get("/", response_model=List[EventResponse])
def get_all_events(db: Session = Depends(get_db)):
    """Retrieve all events."""
    return db.query(Event).all()


@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Retrieve a specific event by ID."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found."
        )
    return event


@router.post("/{event_id}/book", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def book_event(
    event_id: int,
    book_request: Optional[BookEventRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Book one or more seats for an event."""
    event = db.query(Event).filter(Event.id == event_id).with_for_update().first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found."
        )
    number_of_tickets = book_request.number_of_tickets if book_request else 1

    if number_of_tickets <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="number_of_tickets must be at least 1."
        )

    if event.available_seats < number_of_tickets:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Not enough seats available for event '{event.name}'. "
                f"Requested: {number_of_tickets}, Available: {event.available_seats}."
            )
        )
    event.available_seats -= number_of_tickets

    db_booking = Booking(
        event_id=event_id,
        user_id=current_user.id,
        user_name=current_user.username,
        number_of_tickets=number_of_tickets,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    schedule_booking_notification(db_booking.id, event.date)

    await manager.broadcast({
        "type": "seat_update",
        "event_id": event_id,
        "event_name": event.name,
        "available_seats": event.available_seats,
        "total_seats": event.total_seats,
    })

    return db_booking