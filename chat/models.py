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
    room = models.ForeignKey(Room, related_name="participant", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.room.name} {self.user}"

    @classmethod
    def get_friends(cls, user) -> list:
        participants = cls.objects.select_related("room").filter(user=user)
        friend_list = []
        for friend in participants:
            room_id = friend.room.id
            room_name = get_room_name(friend.room.name, user.username)
            friend_list.append({"room_id": room_id, "room_name": room_name})
        return friend_list


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, related_name="message", on_delete=models.CASCADE)
    content = models.TextField()
    time = models.DateTimeField(default=timezone.localtime)
    message_type = models.CharField(
        db_column="type", max_length=50, blank=True, null=True
    )
    status = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self) -> str:
        return f"{self.content}"
