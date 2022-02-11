from django.urls import path,include
from .views import chat_room
urlpatterns=[
    path('<int:room_id>/',chat_room,name="chat-room")
]