import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base, get_db
from main import app

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_event_booking.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client():
    return TestClient(app)


def make_event(client, seats=5, name="Test Event"):
    headers = register_and_login(client)
    return client.post("/events/", json={
        "name": name, "description": "desc",
        "total_seats": seats, "date": "2025-12-01T10:00:00"
    }, headers=headers)


def register_and_login(client, username="alice", password="secret123"):
    client.post("/register", json={"username": username, "password": password})
    login = client.post("/login", json={"username": username, "password": password})
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def auth_post(client, url, headers, json=None):
    return client.post(url, headers=headers, json=json)


# ── Create event ──────────────────────────────────────────────────────────────

class TestCreateEvent:
    def test_create_event_success(self, client):
        r = make_event(client)
        assert r.status_code == 201
        d = r.json()
        assert d["name"] == "Test Event"
        assert d["total_seats"] == 5
        assert d["available_seats"] == 5

    def test_create_event_missing_name(self, client):
        headers = register_and_login(client)
        r = client.post("/events/", json={"total_seats": 5, "date": "2025-12-01T10:00:00"}, headers=headers)
        assert r.status_code == 422

    def test_create_event_zero_seats(self, client):
        headers = register_and_login(client)
        r = client.post("/events/", json={"name": "X", "total_seats": 0, "date": "2025-12-01T10:00:00"}, headers=headers)
        assert r.status_code == 422

    def test_create_event_missing_date(self, client):
        headers = register_and_login(client)
        r = client.post("/events/", json={"name": "X", "total_seats": 10}, headers=headers)
        assert r.status_code == 422


# ── Get events ────────────────────────────────────────────────────────────────

class TestGetEvents:
    def test_get_all_events_empty(self, client):
        r = client.get("/events/")
        assert r.status_code == 200
        assert r.json() == []

    def test_get_all_events(self, client):
        make_event(client, name="A")
        make_event(client, name="B")
        r = client.get("/events/")
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_get_event_by_id(self, client):
        created = make_event(client).json()
        r = client.get(f"/events/{created['id']}")
        assert r.status_code == 200
        assert r.json()["id"] == created["id"]

    def test_get_event_not_found(self, client):
        r = client.get("/events/9999")
        assert r.status_code == 404


# ── Booking ───────────────────────────────────────────────────────────────────

class TestBookEvent:
    def test_book_event_success(self, client):
        headers = register_and_login(client)
        event = make_event(client).json()
        r = auth_post(client, f"/events/{event['id']}/book", headers)
        assert r.status_code == 201
        assert r.json()["user_name"] == "alice"
        assert r.json()["user_id"] is not None
        assert r.json()["number_of_tickets"] == 1

    def test_book_multiple_tickets_success(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=5).json()
        r = auth_post(
            client,
            f"/events/{event['id']}/book",
            headers,
            json={"number_of_tickets": 3},
        )
        assert r.status_code == 201
        assert r.json()["number_of_tickets"] == 3

        updated = client.get(f"/events/{event['id']}").json()
        assert updated["available_seats"] == 2

    def test_book_event_reduces_available_seats(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=5).json()
        auth_post(client, f"/events/{event['id']}/book", headers)
        updated = client.get(f"/events/{event['id']}").json()
        assert updated["available_seats"] == 4

    def test_book_event_fully_booked(self, client):
        alice = register_and_login(client, "alice", "secret123")
        bob = register_and_login(client, "bob", "secret123")
        event = make_event(client, seats=2).json()
        auth_post(client, f"/events/{event['id']}/book", alice)
        auth_post(client, f"/events/{event['id']}/book", bob)
        r = auth_post(client, f"/events/{event['id']}/book", alice)
        assert r.status_code == 400
        assert "not enough seats" in r.json()["detail"].lower()

    def test_book_event_not_enough_seats_for_request(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=2).json()
        r = auth_post(
            client,
            f"/events/{event['id']}/book",
            headers,
            json={"number_of_tickets": 3},
        )
        assert r.status_code == 400
        assert "not enough seats" in r.json()["detail"].lower()

    def test_book_event_rejects_zero_or_negative_tickets(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=5).json()

        zero = auth_post(
            client,
            f"/events/{event['id']}/book",
            headers,
            json={"number_of_tickets": 0},
        )
        negative = auth_post(
            client,
            f"/events/{event['id']}/book",
            headers,
            json={"number_of_tickets": -2},
        )

        assert zero.status_code == 422
        assert negative.status_code == 422

    def test_book_event_exactly_fills_seats(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=3).json()
        for _ in ["A", "B", "C"]:
            r = auth_post(client, f"/events/{event['id']}/book", headers)
            assert r.status_code == 201
        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 0

    def test_book_event_not_found(self, client):
        headers = register_and_login(client)
        r = auth_post(client, "/events/9999/book", headers)
        assert r.status_code == 404

    def test_book_event_requires_authentication(self, client):
        event = make_event(client).json()
        r = client.post(f"/events/{event['id']}/book")
        assert r.status_code == 401


# ── Cancellation ──────────────────────────────────────────────────────────────

class TestCancelBooking:
    def test_cancel_booking_success(self, client):
        headers = register_and_login(client)
        event = make_event(client).json()
        booking = auth_post(client, f"/events/{event['id']}/book", headers).json()
        r = client.delete(f"/bookings/{booking['id']}", headers=headers)
        assert r.status_code == 200
        assert "cancelled" in r.json()["message"].lower()

    def test_cancel_booking_restores_seat(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=1).json()
        booking = auth_post(client, f"/events/{event['id']}/book", headers).json()
        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 0
        client.delete(f"/bookings/{booking['id']}", headers=headers)
        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 1

    def test_cancel_booking_restores_multiple_seats(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=5).json()
        booking = auth_post(
            client,
            f"/events/{event['id']}/book",
            headers,
            json={"number_of_tickets": 3},
        ).json()

        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 2
        client.delete(f"/bookings/{booking['id']}", headers=headers)
        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 5

    def test_cancel_booking_allows_rebooking(self, client):
        headers = register_and_login(client)
        event = make_event(client, seats=1).json()
        booking = auth_post(client, f"/events/{event['id']}/book", headers).json()
        client.delete(f"/bookings/{booking['id']}", headers=headers)
        r = auth_post(client, f"/events/{event['id']}/book", headers)
        assert r.status_code == 201

    def test_cancel_booking_not_found(self, client):
        headers = register_and_login(client)
        r = client.delete("/bookings/9999", headers=headers)
        assert r.status_code == 404

    def test_cancel_booking_twice(self, client):
        headers = register_and_login(client)
        event = make_event(client).json()
        booking = auth_post(client, f"/events/{event['id']}/book", headers).json()
        client.delete(f"/bookings/{booking['id']}", headers=headers)
        r = client.delete(f"/bookings/{booking['id']}", headers=headers)
        assert r.status_code == 404

    def test_cannot_cancel_other_users_booking(self, client):
        alice = register_and_login(client, "alice", "secret123")
        bob = register_and_login(client, "bob", "secret123")
        event = make_event(client).json()
        booking = auth_post(client, f"/events/{event['id']}/book", alice).json()
        r = client.delete(f"/bookings/{booking['id']}", headers=bob)
        assert r.status_code == 403


class TestAuthAndScopedBookings:
    def test_register_and_login(self, client):
        register = client.post("/register", json={"username": "newuser", "password": "secret123"})
        assert register.status_code == 201

        login = client.post("/login", json={"username": "newuser", "password": "secret123"})
        assert login.status_code == 200
        body = login.json()
        assert body["token_type"] == "bearer"
        assert body["access_token"]
        assert body["username"] == "newuser"

    def test_get_bookings_only_returns_current_user(self, client):
        alice = register_and_login(client, "alice", "secret123")
        bob = register_and_login(client, "bob", "secret123")
        event = make_event(client).json()

        auth_post(client, f"/events/{event['id']}/book", alice)
        auth_post(client, f"/events/{event['id']}/book", bob)

        alice_bookings = client.get("/bookings/", headers=alice)
        bob_bookings = client.get("/bookings/", headers=bob)

        assert alice_bookings.status_code == 200
        assert bob_bookings.status_code == 200
        assert len(alice_bookings.json()) == 1
        assert len(bob_bookings.json()) == 1
        assert alice_bookings.json()[0]["user_name"] == "alice"
        assert bob_bookings.json()[0]["user_name"] == "bob"


# ── PDF Spec Examples ─────────────────────────────────────────────────────────

class TestSeatLogic:
    def test_event_a_5_seats_5_bookings_allowed(self, client):
        """PDF: Event A has 5 seats → 5 bookings allowed."""
        headers = register_and_login(client)
        event = make_event(client, seats=5, name="Event A").json()
        for _ in range(5):
            r = auth_post(client, f"/events/{event['id']}/book", headers)
            assert r.status_code == 201

    def test_event_a_6th_person_rejected(self, client):
        """PDF: 6th person tries to book → error."""
        headers = register_and_login(client)
        event = make_event(client, seats=5, name="Event A").json()
        for _ in range(5):
            auth_post(client, f"/events/{event['id']}/book", headers)
        r = auth_post(client, f"/events/{event['id']}/book", headers)
        assert r.status_code == 400

    def test_cancel_restores_1_seat(self, client):
        """PDF: On cancel, 1 seat becomes available."""
        headers = register_and_login(client)
        event = make_event(client, seats=5, name="Event A").json()
        bookings = []
        for _ in range(5):
            b = auth_post(client, f"/events/{event['id']}/book", headers).json()
            bookings.append(b)
        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 0
        client.delete(f"/bookings/{bookings[0]['id']}", headers=headers)
        assert client.get(f"/events/{event['id']}").json()["available_seats"] == 1
