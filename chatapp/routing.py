# The routing file for all websicket 

from django.urls import path

from chat.consumers import ChatConsumer, NotificationConsumer, CallConsumer
from find_friends.consumers import FriendRequestConsumer

websocket_urlpatterns = [
    path("ws/chat/<str:username>/", ChatConsumer.as_asgi()),
    path("ws/call/", CallConsumer.as_asgi()),
    path("ws/chat/", NotificationConsumer.as_asgi()),
    path("ws/friend-request/", FriendRequestConsumer.as_asgi()),
]
