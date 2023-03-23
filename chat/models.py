from datetime import datetime, timedelta

from django.db import models
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Max, Count, Q

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
        # Count the number of unread messages in each room
        unread_messages_count = Count("messages", filter=Q(messages__status="sent"))
        # Order the rooms by their last message and annotate the unread messages
        rooms = (
            rooms.annotate(last_message_time=Max("messages__time"))
            .annotate(unread_messages_count=unread_messages_count)
            .order_by("-last_message_time")
            .distinct()
        )
        list_info = []
        for room in rooms:
            room_info = {}
            room_name = (
                get_room_name(room.name, user.username)
                if room.room_type == "private"
                else room.name
            )
            friend = User.objects.get(username=room_name)
            display_picture = friend.userprofile.get_image
            if room.messages.last():
                last_message = room.messages.last()  # Get the last message in the room
                if last_message.time.date() == datetime.today().date():
                    last_message_time = last_message.time.strftime(
                        "%I:%M %p"
                    )  # returns the time of the message if it was sent today
                elif last_message.time.date() == datetime.today().date() - timedelta(
                    days=1
                ):
                    last_message_time = "Yesterday"
                elif last_message.time.date() == datetime.today().date() - timedelta(
                    days=2
                ):
                    last_message_time = "2 days ago"
                else:
                    last_message_time = last_message.time.strftime(
                        f"%d/%m/%Y"
                    )  # returns the date of the message if it was sent more than 2 days ago
                room_info["last_message"] = last_message.content
                room_info["last_message_time"] = last_message_time
                room_info["last_message_sender"] = last_message.sender.username
            room_info["room_id"] = room.id
            room_info["room_name"] = room_name
            room_info["friend_display_picture"] = display_picture
            room_info["unread_messages"] = room.unread_messages_count
            list_info.append(room_info)
        return list_info


class Participants(models.Model):
    users = models.ManyToManyField(User, related_name="participants")
    room = models.ForeignKey(Room, related_name="chats", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.room.name}"


class Message(models.Model):
    content = models.TextField()
    time = models.DateTimeField(default=timezone.now)
    message_type = models.CharField(
        db_column="type", max_length=50, blank=True, null=True
    )
    STATUS_CHOICES = (("sent", "Sent"), ("read", "Read"))
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="sent", blank=True, null=True
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sent_message"
    )
    room = models.ForeignKey(Room, related_name="messages", on_delete=models.CASCADE)

    def __str__(self) -> str:
        return f"{self.content} by {self.sender.username} in {self.room.name}"
