# settings for development server

import os

from .base import *

DEBUG = os.environ.get("DEBUG")
ALLOWED_HOSTS = []
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.environ.get("CHANNEL_HOST_NAME"), os.environ.get("CHANNEL_PORT"))],
        },
    },
}