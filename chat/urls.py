from django.urls import path, include
from django.contrib.auth.decorators import login_required

from .views import ChatRoomView

app_name = "chat"
urlpatterns = [
    path("<int:room_id>/", login_required(ChatRoomView.as_view()), name="chat-room")
]
