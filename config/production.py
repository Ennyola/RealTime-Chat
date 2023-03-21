# settings for production server

import django_heroku
import dj_database_url

from .base import *

DEBUG = os.environ.get("DEBUG")
ALLOWED_HOSTS = [".herokuapp.com"]
DATABASES = {
    'default': dj_database_url.parse(
        os.environ.get("DATABASE_URL"),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

django_heroku.settings(locals())