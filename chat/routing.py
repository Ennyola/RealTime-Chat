# chat/routing.py
from django.urls import path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    path('ws/chat/<str:username>/', ChatConsumer.as_asgi()),
]
