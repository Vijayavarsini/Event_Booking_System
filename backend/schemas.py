from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from typing import Literal


class EventCreate(BaseModel):
    name: str = Field(..., example="Tech Conference 2025")
    description: Optional[str] = Field(None, example="Annual technology conference")
    total_seats: int = Field(..., gt=0, example=100)
    date: datetime = Field(..., example="2025-12-01T10:00:00")


class EventResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    total_seats: int
    available_seats: int
    date: datetime

    class Config:
        from_attributes = True


class BookingCreate(BaseModel):
    user_name: Optional[str] = Field(None, example="John Doe")
    number_of_tickets: int = Field(1, ge=1, example=2)


class BookEventRequest(BaseModel):
    number_of_tickets: int = Field(1, ge=1, example=2)


class BookingResponse(BaseModel):
    id: int
    event_id: int
    user_id: Optional[int]
    user_name: str
    number_of_tickets: int
    booking_date: datetime

    class Config:
        from_attributes = True


class CalendarEventResponse(BaseModel):
    id: int
    title: str
    start: datetime
    end: datetime
    description: Optional[str] = None


class MessageResponse(BaseModel):
    message: str


class NotificationResponse(BaseModel):
    booking_id: int
    event_id: int
    event_name: str
    event_time: datetime
    number_of_tickets: int
    scheduled_time: Optional[datetime]
    notification_status: Literal["pending", "sent"]

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="alice")
    password: str = Field(..., min_length=6, max_length=128, example="strongpass123")


class UserLogin(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, example="alice")
    password: str = Field(..., min_length=6, max_length=128, example="strongpass123")


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
