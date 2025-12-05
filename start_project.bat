@echo off
echo Starting Heritage Project...

:: ---------- START FRONTEND ----------
echo Starting frontend...
start cmd /k "cd frontend\heritage-project-frontend && npm install && npm run dev"

:: ---------- START BACKEND ----------
echo Starting backend...
start cmd /k "cd backend && pip install -r requirements.txt && python manage.py runserver"

echo Both frontend and backend are running.
pause
