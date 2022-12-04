# chat/routing.py
from django.urls import path

from .consumers import ChatConsumer, CallConsumer

websocket_urlpatterns = [
    path('ws/chat/<str:username>/', ChatConsumer.as_asgi()),
    path('ws/chat/', CallConsumer.as_asgi())
]
