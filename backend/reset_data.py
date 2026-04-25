import sqlite3

DB_PATH = "event_booking.db"
TABLES = ("bookings", "events", "users")


def main() -> None:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("PRAGMA foreign_keys = OFF;")

    for table in TABLES:
        cur.execute(f"DELETE FROM {table};")

    # Reset AUTOINCREMENT counters if sqlite_sequence exists.
    seq_exists = cur.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sqlite_sequence';"
    ).fetchone()
    if seq_exists:
        cur.execute("DELETE FROM sqlite_sequence WHERE name IN ('bookings', 'events', 'users');")

    cur.execute("PRAGMA foreign_keys = ON;")
    conn.commit()

    for table in ("users", "events", "bookings"):
        count = cur.execute(f"SELECT COUNT(*) FROM {table};").fetchone()[0]
        print(f"{table}: {count}")

    conn.close()
    print("Database reset complete.")


if __name__ == "__main__":
    main()
