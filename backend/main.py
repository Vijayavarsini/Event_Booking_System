from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from notification_scheduler import start_notification_scheduler, stop_notification_scheduler
from routers import auth, events, bookings, calendar, notifications
from websocket_manager import manager

init_db()

app = FastAPI(
    title="Event Booking System",
    description="A system for managing events and bookings.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events.router)
app.include_router(bookings.router)
app.include_router(calendar.router)
app.include_router(notifications.router)
app.include_router(auth.router)


@app.on_event("startup")
def on_startup() -> None:
    start_notification_scheduler()


@app.on_event("shutdown")
def on_shutdown() -> None:
    stop_notification_scheduler()


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the Event Booking System. Visit /docs for API documentation."}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time seat availability updates."""
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)