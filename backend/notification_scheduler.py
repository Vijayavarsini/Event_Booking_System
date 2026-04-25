from datetime import datetime, timedelta
import os

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger
from sqlalchemy.orm import joinedload

from database import SessionLocal
from models import Booking, Event


class NotificationChannel:
    """Base channel for notification delivery."""

    def send(self, booking: Booking, event: Event) -> None:
        raise NotImplementedError


class ConsoleNotificationChannel(NotificationChannel):
    """Simple console notification channel used for local testing."""

    def send(self, booking: Booking, event: Event) -> None:
        print(
            "[NOTIFICATION] Reminder: "
            f"User '{booking.user_name}' has event '{event.name}' "
            f"at {event.date.isoformat()} (booking_id={booking.id}, tickets={booking.number_of_tickets})."
        )


scheduler = BackgroundScheduler(timezone="UTC")
notification_channel = ConsoleNotificationChannel()


def _job_id_for_booking(booking_id: int) -> str:
    return f"booking-reminder-{booking_id}"


def _ensure_scheduler_running() -> None:
    if not scheduler.running:
        scheduler.start()


def send_booking_reminder_notification(booking_id: int) -> None:
    """Send notification for a booking and mark it as sent."""
    db = SessionLocal()
    try:
        booking = (
            db.query(Booking)
            .options(joinedload(Booking.event))
            .filter(Booking.id == booking_id)
            .first()
        )
        if not booking or not booking.event:
            return

        if booking.notification_status == "sent":
            return

        notification_channel.send(booking, booking.event)
        booking.notification_status = "sent"
        booking.notification_job_id = None
        db.commit()
    finally:
        db.close()


def schedule_booking_notification(booking_id: int, event_time: datetime) -> None:
    """Schedule reminder 24h before event start; send immediately if past threshold."""
    _ensure_scheduler_running()

    db = SessionLocal()
    try:
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            return

        notify_at = event_time - timedelta(hours=24)
        now_local = datetime.now()
        job_id = _job_id_for_booking(booking_id)

        existing = scheduler.get_job(job_id)
        if existing:
            scheduler.remove_job(job_id)

        booking.scheduled_time = notify_at
        booking.notification_job_id = job_id
        booking.notification_status = "pending"
        db.commit()

        if notify_at <= now_local:
            send_booking_reminder_notification(booking_id)
            return

        scheduler.add_job(
            send_booking_reminder_notification,
            trigger=DateTrigger(run_date=notify_at),
            args=[booking_id],
            id=job_id,
            replace_existing=True,
            max_instances=1,
            misfire_grace_time=3600,
        )
    finally:
        db.close()


def cancel_booking_notification(booking_id: int, job_id: str | None = None) -> None:
    """Cancel a scheduled reminder for a booking."""
    resolved_job_id = job_id or _job_id_for_booking(booking_id)
    existing = scheduler.get_job(resolved_job_id)
    if existing:
        scheduler.remove_job(resolved_job_id)


def rehydrate_pending_notifications() -> None:
    """Rebuild pending jobs after server restart."""
    db = SessionLocal()
    try:
        pending_bookings = (
            db.query(Booking)
            .options(joinedload(Booking.event))
            .filter(Booking.notification_status != "sent")
            .all()
        )
        for booking in pending_bookings:
            if booking.event:
                schedule_booking_notification(booking.id, booking.event.date)
    finally:
        db.close()


def start_notification_scheduler() -> None:
    """Start scheduler once and reload pending reminders."""
    if os.getenv("DISABLE_NOTIFICATION_SCHEDULER", "").lower() == "true":
        return

    _ensure_scheduler_running()
    rehydrate_pending_notifications()


def stop_notification_scheduler() -> None:
    """Shutdown scheduler cleanly."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
