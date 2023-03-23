import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import Message, Participants
from .helpers import get_room_name

channel_layer = get_channel_layer()
USER = get_user_model()


@receiver(post_save, sender=Message)
def send_notification(sender, **kwargs):
    message = kwargs["instance"]
    async_to_sync(channel_layer.group_send)(
        "notifications",
        {
            "type": "new_message",
            "event": "New Message",
            "sender": message.sender.username,
            "sender_image": message.sender.userprofile.get_image,
            "message": message.content,
            "message_time": message.time.strftime("%I:%M %p"),
            "receiver": get_room_name(message.room.name, message.sender.username),
            "room_id": message.room.id,
        },
    )


@receiver(post_save, sender=Participants)
def create_room_in_client(sender, **kwargs):
    if kwargs["created"]:
        participant = kwargs["instance"]
        room = participant.room
        created_by = USER.objects.get(username=room.name.split("-")[0])
        other_user = USER.objects.get(username=room.name.split("-")[1])
        async_to_sync(channel_layer.group_send)(
            "notifications",
            {
                "type": "new_room",
                "event": "Create Room",
                "room_id": room.id,
                "created_by": {
                    "username": created_by.username,
                    "image": created_by.userprofile.get_image,
                },
                "other_user": {
                    "username": other_user.username,
                    "image": other_user.userprofile.get_image,
                },
            },
        )