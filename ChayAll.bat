@echo off
echo ====================================
echo Starting TechMart Application
echo ====================================
echo.

echo Starting Backend Server...
start "TechMart Backend" cmd /k "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "TechMart Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ====================================
echo.
echo Press any key to exit this window (servers will keep running)
pause >nul
