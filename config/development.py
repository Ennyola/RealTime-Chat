# settings for development server

import os

from .base import *

DEBUG = os.environ.get("DEBUG")
ALLOWED_HOSTS = []
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

