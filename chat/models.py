from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

from .helpers import get_room_name

# Create your models here.


class Room(models.Model):
    name = models.CharField(max_length=500)

    def __str__(self) -> str:
        return f"{self.name}"


class Participants(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(
        Room, related_name="participants", on_delete=models.CASCADE
    )

    def __str__(self):
        return f"{self.room.name} {self.user}"

    @classmethod
    def get_friends(cls, user) -> list:
        """To get all the friends of a user"""
        participants = cls.objects.select_related("room").filter(user=user)
        print(participants)
        friend_list = []
        for friend in participants:
            room_id = friend.room.id
            room_name = get_room_name(friend.room.name, user.username)
            latest_message = friend.room.messages.last()
            friend_list.append(
                {
                    "room_id": room_id,
                    "room_name": room_name,
                    "latest_message": latest_message,
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
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name="messages", on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.content}"
