@echo off
title LifeSync AI - Backend Service
echo ========================================================
echo  LifeSync AI - FastAPI Backend Server
echo  Hosting at: http://127.0.0.1:8000
echo  API Docs:   http://127.0.0.1:8000/docs
echo  Health:     http://127.0.0.1:8000/api/health
echo ========================================================
cd /d "%~dp0backend"
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found in backend\venv.
    echo Please create it with: python -m venv backend\venv
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
