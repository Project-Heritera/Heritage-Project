#!/bin/bash

echo "Starting Heritage Project..."

# ---------- FRONTEND ----------
echo "Starting frontend..."
( cd frontend/heritage-project-frontend && npm install && npm run dev ) &

# ---------- BACKEND ----------
echo "Starting backend..."
( cd backend && pip install -r requirements.txt && python manage.py runserver )

wait
