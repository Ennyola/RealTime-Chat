from django.shortcuts import render
from django.views import View
from django.contrib.auth.decorators import login_required

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

        friend_list = Participants.get_friends(request.user)
        context = super().get_context_data(user=request.user)
        return render(request, "chat/index.html", context)


class ChatRoomView(FriendListMixin, View):
    def get(self, request, **kwargs):
        messages = Message.objects.filter(room_id=kwargs["room_id"])
        room = Room.objects.get(id=kwargs["room_id"])
        context = super().get_context_data(user=request.user)
        context.update(
            {
                "messages": messages,
                "room_name": get_room_name(room.name, request.user.username),
            }
        )
        return render(request, "chat/chat-room.html", context)

