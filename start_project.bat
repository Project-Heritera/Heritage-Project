@echo off
echo Starting Heritage Project...

:: ---------- START FRONTEND ----------
echo Starting frontend...
start "" /min cmd /k "cd /d "%~dp0frontend\heritage-project-frontend" && npm install && npm run dev"

:: ---------- START BACKEND ----------
echo Starting backend...
start "" /min cmd /k "cd /d "%~dp0backend" && start_backend.bat"

:: ---------- OPEN FRONTEND IN BROWSER ----------
start "" http://localhost:5173/

echo Both frontend and backend are running.
pause
