# settings for production server

import django_heroku

from .base import *

DEBUG = os.environ.get("DEBUG")

ALLOWED_HOSTS = []

django_heroku.settings(locals())