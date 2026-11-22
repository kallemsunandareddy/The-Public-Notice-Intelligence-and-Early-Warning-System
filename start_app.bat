@echo off
title Civic Notice Intelligence - Server Launcher
color 0b

echo ========================================================
echo    Starting Civic Notice Intelligence Application...
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching Backend Server on port 8000...
start "Civic Backend (FastAPI)" cmd /k "backend\python_embed\python.exe backend\run_server.py"

echo [2/2] Launching Frontend Server on port 5173...
start "Civic Frontend (Vite)" cmd /k "cd frontend && npx vite --port 5173 --host 127.0.0.1"

echo.
echo ========================================================
echo  Servers are starting in their respective windows!
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:8000
echo  API Docs : http://localhost:8000/docs
echo ========================================================
echo.
timeout /t 5 >nul
start http://localhost:5173
