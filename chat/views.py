from itertools import groupby

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.shortcuts import render
from django.views import View
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from find_friends.models import FriendRequest
from .models import Room, Message
from .helpers import get_room_name

channel_layer = get_channel_layer()


class UnseenFriendRequestMixin(object):
    def get_unseen_friend_requests_count(self, username):
        unseen_friend_requests_count = FriendRequest.unseen_requests.filter(
            username=username
        ).count()
        return unseen_friend_requests_count

    def get_context_data(self, **kwargs):
        username = kwargs.get("username")
        unseen_friend_requests_count = self.get_unseen_friend_requests_count(
            username=username
        )
        context = {"unseen_friend_requests_count": unseen_friend_requests_count}
        return context


class RoomListMixin(UnseenFriendRequestMixin):
    def get_rooms(self, **kwargs):
        user = kwargs.get("user")
        rooms = Room.get_rooms_and_related_info(user)
        return rooms

    def get_context_data(self, **kwargs):
        user = kwargs.get("user")
        context = super().get_context_data(username=user.username)
        rooms = self.get_rooms(user=user)
        context["rooms"] = rooms
        return context


class ChatIndexView(RoomListMixin, View):
    def get(self, request, *args, **kwargs):
        context = super().get_context_data(user=request.user)  
        print(context)
        return render(request, "chat/index.html", context)


class ChatRoomView(RoomListMixin, View):
    def get(self, request, **kwargs):

        messages = Message.objects.filter(room_id=kwargs["room_id"])
        # Get the room a user belongs to.
        # Returns a 404 error if the room doesn't exist
        room = get_object_or_404(Room, id=kwargs["room_id"], chats__users=request.user)
        unread_messages = messages.filter(status="sent")
        if unread_messages.exists():
            unread_messages_sender = unread_messages.last().sender.username
            async_to_sync(channel_layer.group_send)(
                room.name,
                {
                    "type": "change_messages_status",
                    "messages_sender": unread_messages_sender,
                },
            )
            # Mark all unread messages as read
            if unread_messages_sender != request.user.username:
                unread_messages.update(status="read")
        # Group messages by date so it'll be rendered accordingly on the webpage
        grouped_messages = groupby(messages, lambda message: message.time.date())
        message_groups = [
            {"date": date.strftime("%A, %B %d, %Y"), "messages": list(messages)}
            for date, messages in grouped_messages
        ]

        context = super().get_context_data(user=request.user)
        print(context)
        if room.room_type == "private":
            context["room_name"] = get_room_name(room.name, request.user.username)
        else:
            context["room_name"] = room.name
        friend = get_user_model().objects.get(username=context["room_name"])
        context["message_groups"] = message_groups
        context["display_picture"] = friend.userprofile.get_image
        return render(request, "chat/chat_room.html", context)
