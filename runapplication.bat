@echo off
echo Starting backend...
call env\Scripts\activate
start "Backend" cmd /k "cd backend && python main.py"
echo Starting frontend...
cd frontend
start "Frontend" cmd /k "npm start"
cd ..
echo Application started.
echo Backend running at: http://localhost:8000
echo Frontend running at: http://localhost:3000
echo Swagger UI available at: http://localhost:8000/docs
