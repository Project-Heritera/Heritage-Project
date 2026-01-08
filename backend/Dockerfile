# Dockerfile
FROM python:3.11-slim


WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy project
COPY . .


# Run Gunicorn
CMD ["sh", "-c", "python manage.py collectstatic --noinput && gunicorn heritage_project_backend.wsgi:application --bind 0.0.0.0:${PORT}"]
