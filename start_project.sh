#!/bin/bash

echo "Starting Heritage Project..."

# ---------- START FRONTEND ----------
echo "Starting frontend..."
(
  cd frontend/heritage-project-frontend || exit
  npm install
  npm run dev
) >/dev/null 2>&1 &   # run silently in background

# ---------- START BACKEND ----------
echo "Starting backend..."
(
  cd backend || exit
  pip install -r requirements.txt
  python manage.py runserver
) >/dev/null 2>&1 &   # run silently in background

# ---------- OPEN FRONTEND IN BROWSER ----------
# macOS uses 'open', Linux uses 'xdg-open'
if command -v xdg-open >/dev/null; then
  xdg-open "http://localhost:5173/"
elif command -v open >/dev/null; then
  open "http://localhost:5173/"
else
  echo "Please open http://localhost:5173/ in your browser."
fi

echo "Both frontend and backend are running."
wait
