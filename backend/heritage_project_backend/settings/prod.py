from .base import *
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qsl


load_dotenv()

DEBUG = False

#store media in gcp bucket
DEFAULT_FILE_STORAGE = "storages.backends.gcloud.GoogleCloudStorage"
GCP_BUCKET_NAME = os.environ.get("GCP_BUCKET_NAME") 
MEDIA_URL = f"https://storage.googleapis.com/{GCP_BUCKET_NAME}/"


ALLOWED_HOSTS = [
    host.strip()
    for host in os.environ.get("DJANGO_ALLOWED_HOSTS", "").split(",")
    if host.strip()
]
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",")
    if origin.strip()
]
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("DJANGO_CORS_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]


tmpPostgres = urlparse(os.getenv("DATABASE_URL"))

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': tmpPostgres.path.replace('/', ''),
        'USER': tmpPostgres.username,
        'PASSWORD': tmpPostgres.password,
        'HOST': tmpPostgres.hostname,
        'PORT': 5432,
        'OPTIONS': dict(parse_qsl(tmpPostgres.query)),
    }
}
