from django.shortcuts import render
from django.views import View
from django.contrib.auth import get_user_model

from emoji import Emoji

from .models import Room, Message, Participants
from .helpers import get_room_name

# Create your views here.


class FriendListMixin:
    def get_context_data(self, **kwargs):
        user = kwargs.get("user")
        context = {}
        context["friends"] = Participants.get_friends(user)
        return context


class ChatIndexView(FriendListMixin, View):
    def get(self, request, *args, **kwargs):
        context = super().get_context_data(user=request.user)
        return render(request, "chat/index.html", context)


class ChatRoomView(FriendListMixin, View):
    def get(self, request, **kwargs):
        context = super().get_context_data(user=request.user)
        messages = Message.objects.filter(room_id=kwargs["room_id"])
        room = Room.objects.get(id=kwargs["room_id"])
        context["messages"] = messages
        context["room_name"] = get_room_name(room.name, request.user.username)
        friend = get_user_model().objects.get(username=context["room_name"])
        context["display_picture"] = friend.userprofile.get_image
        return render(request, "chat/chat-room.html", context)
