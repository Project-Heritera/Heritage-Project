@echo off
echo Starting Heritage Project...

:: ---------- START FRONTEND ----------
echo Starting frontend...
start /min cmd /k "cd frontend\heritage-project-frontend && npm install && npm run dev"

:: ---------- START BACKEND ----------
echo Starting backend...
start /min cmd /k "cd backend && pip install -r requirements.txt && python manage.py runserver"

:: ---------- OPEN FRONTEND IN BROWSER ----------
start http://localhost:5173/

echo Both frontend and backend are running.
pause
