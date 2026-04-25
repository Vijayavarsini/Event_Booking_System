from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./event_booking.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def init_db() -> None:
    """Initialize tables and apply lightweight compatibility updates for SQLite."""
    import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(bookings)").fetchall()
        }
        if "user_id" not in columns:
            connection.exec_driver_sql("ALTER TABLE bookings ADD COLUMN user_id INTEGER")
        if "number_of_tickets" not in columns:
            connection.exec_driver_sql(
                "ALTER TABLE bookings ADD COLUMN number_of_tickets INTEGER NOT NULL DEFAULT 1"
            )
        if "notification_status" not in columns:
            connection.exec_driver_sql(
                "ALTER TABLE bookings ADD COLUMN notification_status TEXT NOT NULL DEFAULT 'pending'"
            )
        if "scheduled_time" not in columns:
            connection.exec_driver_sql(
                "ALTER TABLE bookings ADD COLUMN scheduled_time DATETIME"
            )
        if "notification_job_id" not in columns:
            connection.exec_driver_sql(
                "ALTER TABLE bookings ADD COLUMN notification_job_id TEXT"
            )


def get_db():
    """Dependency injection for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
