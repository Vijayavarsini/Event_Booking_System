from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from auth import get_current_user
from database import get_db
from models import Booking, Event, User
from notification_scheduler import cancel_booking_notification
from schemas import MessageResponse, BookingResponse
from websocket_manager import manager

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve bookings only for the logged-in user."""
    return (
        db.query(Booking)
        .filter(Booking.user_id == current_user.id)
        .order_by(Booking.booking_date.desc())
        .all()
    )


@router.delete("/{booking_id}", response_model=MessageResponse)
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Cancel a booking and restore the seat to the event."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with id {booking_id} not found."
        )
    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to cancel this booking.",
        )
    event = db.query(Event).filter(Event.id == booking.event_id).with_for_update().first()
    if event:
        event.available_seats += booking.number_of_tickets

    cancel_booking_notification(booking.id, booking.notification_job_id)

    db.delete(booking)
    db.commit()

    # Broadcast real-time update to all WebSocket clients
    if event:
        await manager.broadcast({
            "type": "seat_update",
            "event_id": event.id,
            "event_name": event.name,
            "available_seats": event.available_seats,
            "total_seats": event.total_seats,
        })

    return {
        "message": (
            f"Booking {booking_id} cancelled successfully. "
            f"{booking.number_of_tickets} seat(s) restored."
        )
    }