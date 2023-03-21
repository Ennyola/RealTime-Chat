"""
ASGI config for chatapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

from django.conf import settings
from django.core.asgi import get_asgi_application

from .routing import websocket_urlpatterns

if settings.DEBUG:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.development')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.production')
    
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns,
        )
    )
})
