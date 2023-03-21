"""
ASGI config for chatapp project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
"""

import os

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter

from django.core.asgi import get_asgi_application

if os.environ.get('DEBUG', False):
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.development')
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.production')
 
django_asgi_app = get_asgi_application()   

from .routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns,
        )
    )
})
