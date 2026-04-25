from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

import models
import schemas


# ── Events ─────────────────────────────────────────────────────────────────────

def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    db_event = models.Event(
        name=event.name,
        description=event.description,
        total_seats=event.total_seats,
        available_seats=event.total_seats,  # initially all seats are available
        date=event.date,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def get_events(db: Session) -> List[models.Event]:
    return db.query(models.Event).all()


def get_event(db: Session, event_id: int) -> Optional[models.Event]:
    return db.query(models.Event).filter(models.Event.id == event_id).first()


# ── Bookings ───────────────────────────────────────────────────────────────────

def create_booking(db: Session, event_id: int, booking: schemas.BookingCreate) -> models.Booking:
    """Book one or more seats for an event. Decrements available_seats atomically."""
    event = db.query(models.Event).filter(models.Event.id == event_id).with_for_update().first()

    if not event:
        return None  # caller raises 404

    if booking.number_of_tickets <= 0:
        return "invalid_ticket_count"  # caller raises 400/422

    if event.available_seats < booking.number_of_tickets:
        return "not_enough_seats"  # caller raises 400

    # Decrement seat count
    event.available_seats -= booking.number_of_tickets

    db_booking = models.Booking(
        event_id=event_id,
        user_name=booking.user_name,
        number_of_tickets=booking.number_of_tickets,
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def get_booking(db: Session, booking_id: int) -> Optional[models.Booking]:
    return db.query(models.Booking).filter(models.Booking.id == booking_id).first()


def delete_booking(db: Session, booking_id: int) -> bool:
    """Cancel a booking and restore the seat."""
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()

    if not booking:
        return False

    # Restore the seat
    event = db.query(models.Event).filter(models.Event.id == booking.event_id).with_for_update().first()
    if event:
        event.available_seats += booking.number_of_tickets

    db.delete(booking)
    db.commit()
    return True
