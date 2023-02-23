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
            room_name = (
                get_room_name(room.name, user.username)
                if cls.room_type == "private"
                else cls.name
            )
            print(room_name)
            print(get_room_name(room.name, user.username))
            # friend = User.objects.get(username=room_name)
            # display_picture = friend.userprofile.get_image
            last_message = room.messages.last()
            list_info.append(
                {
                    "room_id": room.id,
                    "room_name": room_name,
                    "last_message": last_message,
                    "last_message_time": last_message.time.strftime("%H:%M"),
                    # "display_picture": display_picture,
                }
            )


class Participants(models.Model):
    users = models.ManyToManyField(User, related_name="participants")
    room = models.ForeignKey(Room, related_name="chats", on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.room.name}"

    @classmethod
    def get_friends(cls, user) -> list:
        """To get all the friends associated with a user"""

        # This fetches all participants in a room having a relationship
        # with the current user nd orders the query by the room's last message.
        participants = (
            cls.objects.select_related("room")
            .filter(users=user)
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
            print(friend)
            room_id = friend.room.id
            room_name = get_room_name(friend.room.name, user.username)
            latest_message = friend.room.messages.last()
            friend_user_object = User.objects.get(username=room_name)
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
