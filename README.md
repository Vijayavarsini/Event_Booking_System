# Event Booking System

Event Booking System is a full-stack application for creating events, booking seats, canceling bookings, and receiving reminder notifications before events start.

## Project Explanation

This project demonstrates a complete event management workflow from API to UI:

- Admin or authorized users create events with name, description, date/time, and seat capacity.
- End users register, log in, and book available seats.
- Booking logic is protected to prevent overbooking when many users try to book at the same time.
- Users can cancel bookings, and seat availability is restored immediately.
- A notification scheduler tracks upcoming events and exposes reminder status (pending, sent, started).

The backend is built with FastAPI and SQLAlchemy, with Alembic migrations for database versioning. The frontend is a React application that consumes the REST API and displays booking/event state to users. A generated Python SDK in event_sdk provides programmatic API access for external clients.

In short, the system is designed to show production-style fundamentals: authenticated user flows, safe booking transactions, migration-based schema management, automated tests, OpenAPI documentation, and SDK generation.

## Tech Stack

- Backend: FastAPI, SQLAlchemy, Alembic, SQLite
- Frontend: React, Axios
- SDK: OpenAPI Generator (Python SDK in event_sdk)
- Tests: pytest

## Project Structure

```text
event_booking_system/
|-- backend/                # FastAPI app, routers, models, migrations, tests
|-- frontend/               # React frontend
|-- event_sdk/              # Generated Python SDK and example usage
|-- setupdev.bat            # Developer setup script (Windows)
|-- runapplication.bat      # Starts backend and frontend (Windows)
|-- generate_sdk.bat        # Regenerates Python SDK from OpenAPI
`-- README.md
```

## Prerequisites

Install the following before setup:

- Python 3.11+
- Node.js 18+
- npm (bundled with Node.js)

Optional:

- Java 11+ (required only for some OpenAPI Generator environments)

## Installation

### Option A: Recommended (Windows scripts)

From the repository root:

```bat
setupdev.bat
```

What this script does:

- Creates a virtual environment at env
- Installs backend dependencies from backend/requirements.txt
- Runs Alembic migrations (with fallback bootstrap and stamp)
- Installs frontend dependencies with npm install

### Option B: Manual setup

1. Create and activate virtual environment

```bat
python -m venv env
env\Scripts\activate
```

2. Install backend dependencies

```bat
pip install -r backend\requirements.txt
```

3. Run database migrations

```bat
cd backend
alembic upgrade head
cd ..
```

4. Install frontend dependencies

```bat
cd frontend
npm install
cd ..
```

## Execution

### Option A: Start both services with script

```bat
runapplication.bat
```

This starts:

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- Swagger UI: http://localhost:8000/docs

### Option B: Start services manually

1. Start backend

```bat
env\Scripts\activate
cd backend
python main.py
```

2. In a new terminal, start frontend

```bat
cd frontend
npm start
```

## Running Tests

From the repository root:

```bat
env\Scripts\python -m pytest backend/tests/test_events.py
```

## Notifications

The backend includes a scheduler for reminder notifications and startup recovery.

Current reminder behavior includes:

- Notification status tracking for pending reminders
- Sent marker when the reminder time is reached
- Started marker when the event start time has passed

Frontend notification status is shown in the notifications panel.

## API and WebSocket

- REST API docs: http://localhost:8000/docs
- OpenAPI JSON: http://localhost:8000/openapi.json
- WebSocket endpoint: ws://localhost:8000/ws

## SDK Generation

The repository includes an SDK folder and a regeneration script.

### Regenerate SDK with script

Make sure backend is running, then execute:

```bat
generate_sdk.bat
```

### Regenerate SDK manually

```bat
npx @openapitools/openapi-generator-cli generate -i http://localhost:8000/openapi.json -g python -o event_sdk --additional-properties=packageName=event_sdk
```

If generation fails with Java class version errors, install or switch to Java 11+ and rerun.

## Troubleshooting

- If migrations fail during setup, rerun setupdev.bat. The script includes a compatibility fallback path.
- If backend tests fail outside env, run tests with env/Scripts/python to ensure correct dependencies.
- If frontend cannot connect, confirm backend is running on port 8000.
