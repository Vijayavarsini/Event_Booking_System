from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)

    __table_args__ = (
        CheckConstraint("available_seats >= 0", name="check_available_seats_non_negative"),
    )

    bookings = relationship("Booking", back_populates="event", cascade="all, delete")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    user_name = Column(String, nullable=False)
    number_of_tickets = Column(Integer, nullable=False, default=1, server_default="1")
    notification_status = Column(String, nullable=False, default="pending", server_default="pending")
    scheduled_time = Column(DateTime, nullable=True)
    notification_job_id = Column(String, nullable=True)
    booking_date = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="bookings")
    user = relationship("User", back_populates="bookings")
