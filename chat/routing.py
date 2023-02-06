# chat/routing.py
from django.urls import path

from .consumers import ChatConsumer, NotificationConsumer, CallConsumer

websocket_urlpatterns = [
    path("ws/chat/<str:username>/", ChatConsumer.as_asgi()),
    path("ws/call/", CallConsumer.as_asgi()),
    path("ws/chat/", NotificationConsumer.as_asgi()),
    
]
