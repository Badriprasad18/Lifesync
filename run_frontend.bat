@echo off
title LifeSync AI - Frontend Client
echo ========================================================
echo  LifeSync AI - React + Vite + Tailwind Client
echo  Hosting at: http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo [ERROR] node_modules not found in frontend.
    echo Please run: npm install
    pause
    exit /b 1
)
npm run dev
pause
