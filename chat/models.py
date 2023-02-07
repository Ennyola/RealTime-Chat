from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model

from .helpers import get_room_name

# Create your models here.

USER = get_user_model()


class Room(models.Model):
    name = models.CharField(max_length=500)

    def __str__(self) -> str:
        return f"{self.name}"


class Participants(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(
        Room, related_name="participants", on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.room.name} {self.user}"

    @classmethod
    def get_friends(cls, user) -> list:
        """To get all the friends associated with a user"""

        # This fetches all participants in a room having a relationship
        # with the current user nd orders the query by the room's last message.
        participants = (
            cls.objects.select_related("room")
            .filter(user=user)
            .order_by("-room__messages__time")
        )

        # Ordering the rooms using their
        # last message returns a queryset with duplicate rooms
        # The code below removes duplicates rooms
        # while still ordering the rooms by their last message
        unique_participants = []
        [
            unique_participants.append(x)
            for x in participants
            if x not in unique_participants
        ]
        friend_list = []
        for friend in unique_participants:
            room_id = friend.room.id
            room_name = get_room_name(friend.room.name, user.username)
            latest_message = friend.room.messages.last()
            friend_user_object = USER.objects.get(username=room_name)
            display_picture = friend_user_object.userprofile.get_image
            friend_list.append(
                {
                    "room_id": room_id,
                    "room_name": room_name,
                    "latest_message": latest_message,
                    "display_picture": display_picture,
                }
            )
        return friend_list


class Message(models.Model):
    content = models.TextField()
    time = models.DateTimeField(default=timezone.localtime)
    message_type = models.CharField(
        db_column="type", max_length=50, blank=True, null=True
    )
    status = models.CharField(max_length=20, blank=True, null=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name="messages", on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.content}"


# class Chat(models.Model):
#     participants = models.ManyToManyField(User, related_name="chats")
#     group_name = models.CharField(max_length=100, blank=True, null=True)

# class Message(models.Model):
#     chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name="messages")
#     sender = models.ForeignKey(User, on_delete=models.CASCADE)
#     content = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)