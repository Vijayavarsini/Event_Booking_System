"""
Example usage of the Event Booking SDK.
Generated via: openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o event_sdk
"""
from event_sdk.api.events_api import EventsApi, BookingsApi, AuthApi
from event_sdk import ApiClient, Configuration

config = Configuration(host="http://localhost:8000")
client = ApiClient(config)

auth_api = AuthApi(client)
events_api = EventsApi(client)
bookings_api = BookingsApi(client)

username = "sdk_user"
password = "secret123"

try:
    auth_api.register_register_post(username=username, password=password)
except Exception:
    # User may already exist in repeated local runs.
    pass

login = auth_api.login_login_post(username=username, password=password)
config.access_token = login["access_token"]

# List all events
events = events_api.get_events_events_get()
print("All events:")
for event in events:
    print(f"  {event}")

# Create a new event
new_event = events_api.create_event_events_post(
    name="SDK Test Event",
    total_seats=5,
    date="2026-12-01T10:00:00",
    description="Created from the SDK"
)
print(f"\nCreated event: {new_event}")

# Book seats
booking = events_api.book_event_events_event_id_book_post(
    event_id=new_event.id,
    number_of_tickets=2,
)
print(f"\nBooking created: {booking}")

# Cancel the booking
result = bookings_api.cancel_booking_bookings_booking_id_delete(booking.id)
print(f"\nCancellation result: {result}")
