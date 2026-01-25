from .base import *
import os

DEBUG = True
ALLOWED_HOSTS = ["*"]
CORS_ALLOW_ALL_ORIGINS = True

#store media locally 
# Media files (user-uploaded files)
MEDIA_URL = "/images/"
MEDIA_ROOT = BASE_DIR / "images"


# Local Postgres (or dev DB)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

