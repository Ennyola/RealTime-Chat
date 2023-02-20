from django.db.models.signals import post_save
from django.dispatch import receiver

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Message
from .helpers import get_room_name

@receiver(post_save, sender=Message)
def send_notification(sender, **kwargs):
    message = kwargs["instance"]
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "notifications",
        {
            "type": "new_message",
            "event": "New Message",
            "sender": message.sender.username,
            "message": message.content,
            "receiver": get_room_name(message.room.name, message.sender.username),
            "room_id": message.room.id,
        },
    )
