from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Max

from .helpers import get_room_name

# Create your models here.

User = get_user_model()


class Room(models.Model):
    name = models.CharField(max_length=500)
    room_type = models.CharField(max_length=10, default="private")

    def __str__(self) -> str:
        return f"{self.name}"

    @classmethod
    def get_rooms_and_related_info(cls, user):
        rooms = cls.objects.filter(chats__users=user)
        # Order the rooms by their last message
        rooms = rooms.annotate(last_message_time=Max("messages__time")).order_by(
            "-last_message_time"
        )
        list_info = []
        for room in rooms:
            if room.room_type == "private":
                room_name = get_room_name(room.name, user.username)
            else:
                room_name = room.name
            friend = User.objects.get(username=room_name)
            display_picture = friend.userprofile.get_image
            last_message = room.messages.last()
            list_info.append(
                {
                    "room_id": room.id,
                    "room_name": room_name,
                    "last_message": last_message,
                    "last_message_time": last_message.time.strftime("%H:%M"),
                    "friend_display_picture": display_picture,
                }
            )
        return list_info


class Participants(models.Model):
    users = models.ManyToManyField(User, related_name="participants")
    room = models.ForeignKey(Room, related_name="chats", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.room.name}"


class Message(models.Model):
    content = models.TextField()
    time = models.DateTimeField(default=timezone.localtime)
    message_type = models.CharField(
        db_column="type", max_length=50, blank=True, null=True
    )
    status = models.CharField(max_length=20, blank=True, null=True)
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_message"
    )
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
