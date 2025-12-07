@echo off
cd /d "%~dp0"

:: Create virtual environment if it doesn't exist
if not exist Heritage-Project (
    python -m venv Heritage-Project
)

:: Activate virtual environment
call Heritage-Project\Scripts\activate

:: Upgrade pip and install requirements
pip install --upgrade pip
pip install -r requirements.txt

:: Start Django server
python manage.py runserver
