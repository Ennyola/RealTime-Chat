# settings for production server

from .base import *

DEBUG = os.environ.get("DEBUG")

ALLOWED_HOSTS = []