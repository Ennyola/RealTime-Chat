import datetime
import json

from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async
from django.db.models import Q

from channels.generic.websocket import AsyncWebsocketConsumer

from chat.models import Message, Room, Participants

USER = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.friend_username = self.scope["url_route"]["kwargs"]["username"]
        self.friend_model_object = await sync_to_async(USER.objects.get)(
            username=self.friend_username
        )

        # Gets the room name from friend username and user username.
        self.room = await sync_to_async(Room.objects.get)(
            Q(name=f'{self.friend_username}_{self.scope["user"]}')
            | Q(name=f'{self.scope["user"]}_{self.friend_username}')
        )
        self.room_group_name = self.room.name

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["messageContent"]
        sender = text_data_json["sender"]
        time = text_data_json["time"]
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "sender": sender,
                "time": time,
            },
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        time = event["time"]

        # If the currently logged in user is not the sender, do not save the message sent to the server.
        # This logic is useful because we do not want to save the message twice in the database.
        if self.scope["user"].username == sender:
            await self.save_message(self.scope["user"], message, self.room, time)

        await self.send(
            text_data=json.dumps(
                {"type": "message", "message_content": message, "sender": sender, "time": time}
            )
        )

    @sync_to_async
    def save_message(self, user, content, room, timestamp):
        timestamp = timestamp//1000 # Convert the timestamp to seconds from milliseconds
        time = datetime.datetime.fromtimestamp(timestamp)
        Message.objects.create(sender=user, room=room, content=content, time=time)
