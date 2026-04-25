@echo off
echo Setting up backend...
python -m venv env
call env\Scripts\activate
pip install -r backend\requirements.txt
cd backend
alembic upgrade head
if errorlevel 1 (
	echo Alembic upgrade failed. Attempting compatibility bootstrap for existing DB...
	python -c "from database import init_db; init_db(); print('Database compatibility bootstrap complete.')"
	if errorlevel 1 (
		echo Database bootstrap failed.
		exit /b 1
	)
	alembic stamp head
	if errorlevel 1 (
		echo Alembic stamp failed.
		exit /b 1
	)
)
echo Skipping seed data by default to keep database clean.
echo If you want sample data later, run: sqlite3 event_booking.db ^< seed_data.sql
cd ..
echo Setting up frontend...
cd frontend
npm install
cd ..
echo Setup complete.
