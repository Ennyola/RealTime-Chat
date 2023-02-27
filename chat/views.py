from itertools import groupby

from django.shortcuts import render
from django.views import View
from django.contrib.auth import get_user_model

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
        context = {"rooms": rooms}
        return context


class ChatIndexView(RoomListMixin, View):
    def get(self, request, *args, **kwargs):
        context = super().get_context_data(user=request.user)
        return render(request, "chat/index.html", context)


class ChatRoomView(RoomListMixin, View):
    def get(self, request, **kwargs):
        context = super().get_context_data(user=request.user)
        messages = Message.objects.filter(room_id=kwargs["room_id"])
        # Group messages by date so it'll be rendered accordingly on the webpage
        grouped_messages = groupby(messages, lambda message: message.time.date())
        message_groups = [{"date": date.strftime("%A, %B %d"), "messages": list(messages)} for date, messages in grouped_messages]
        room = Room.objects.get(id=kwargs["room_id"])
        
        if room.room_type == "private":
            context["room_name"] = get_room_name(room.name, request.user.username)
        else:
            context["room_name"] = room.name
        friend = get_user_model().objects.get(username=context["room_name"])
        context["message_groups"] = message_groups
        context["display_picture"] = friend.userprofile.get_image
        return render(request, "chat/chat-room.html", context)
