from django.db.models.signals import post_save
from django.dispatch import receiver

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import FriendRequest, Friendship


@receiver(post_save, sender=FriendRequest)
def send_friend_request(sender, **kwargs):
    friend_request = kwargs["instance"]
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "notifications",
        {
            "type": "friend_request",
            "event": "New Friend Request",
            "sender_id": friend_request.from_user.id,
            "sender": friend_request.from_user.username,
            "receiver": friend_request.to_user.username,
            "sender_avatar": friend_request.from_user.userprofile.get_image,
        },
    )
