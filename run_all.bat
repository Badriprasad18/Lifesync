@echo off
title LifeSync AI - Complete Platform Launcher
echo ========================================================
echo   LifeSync AI - Complete Platform Launcher
echo   Starting FastAPI Backend and Vite React Frontend
echo ========================================================

echo [1/2] Launching Backend Server (http://127.0.0.1:8000)...
start "LifeSync AI - Backend (FastAPI)" cmd /c "run_backend.bat"

timeout /t 2 >nul

echo [2/2] Launching Frontend Client (http://localhost:5173)...
start "LifeSync AI - Frontend (React)" cmd /c "run_frontend.bat"

echo.
echo ========================================================
echo   Both services have been launched in separate windows!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause
