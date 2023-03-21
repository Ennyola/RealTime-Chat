"""
WSGI config for chatapp project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

if os.environ.get("DEBUG", False):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.development')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.production')
    

application = get_wsgi_application()
