from django.shortcuts import render
from django.views import View
from django.contrib.auth import get_user_model,get_user
from django.db.models import Max

from emoji import Emoji

from .models import Room, Message, Participants
from .helpers import get_room_name

# Create your views here.


class RoomListMixin:
    def get_rooms(self, **kwargs):
        user = kwargs.get("user")
        rooms = Room.get_rooms_and_related_info(user)
        return rooms

    def get_context_data(self, **kwargs):
        user = kwargs.get("user")
        rooms = self.get_rooms(user=user)
        context = {
            "rooms": rooms
        }
        return context


class ChatIndexView(RoomListMixin, View):
    def get(self, request, *args, **kwargs):
        context = super().get_context_data(user=request.user)
        return render(request, "chat/index.html", context)


class ChatRoomView(RoomListMixin, View):
    def get(self, request, **kwargs):
        context = super().get_context_data(user=request.user)
        messages = Message.objects.filter(room_id=kwargs["room_id"])
        room = Room.objects.get(id=kwargs["room_id"])
        context["messages"] = messages
        if room.room_type =="private": 
            context["room_name"] = get_room_name(room.name, request.user.username)
        else:
            context["room_name"] = room.name
        friend = get_user_model().objects.get(username=context["room_name"])
        context["display_picture"] = friend.userprofile.get_image
        return render(request, "chat/chat-room.html", context)
