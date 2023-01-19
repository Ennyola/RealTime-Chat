from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.conf import settings
from .helpers import get_room_name

# Create your models here.


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

        participants = (
            cls.objects.select_related("room")
            .filter(user=user)
            .order_by("-room__messages__time")
        )
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
            display_picture = friend.user.userprofile.display_picture
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
