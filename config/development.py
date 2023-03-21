# settings for development server

import os

from .base import *

DEBUG = os.environ.get("DEBUG")
ALLOWED_HOSTS = []