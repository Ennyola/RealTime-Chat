# settings for production server

import django_heroku

from .base import *

DEBUG = os.environ.get("DEBUG")

ALLOWED_HOSTS = []

# Channel layer config
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.environ.get("CHANNEL_HOST_NAME"), os.environ.get("CHANNEL_PORT"))],
        },
    },
}
django_heroku.settings(locals())