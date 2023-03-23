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
            Q(name=f'{self.friend_username}-{self.scope["user"]}')
            | Q(name=f'{self.scope["user"]}-{self.friend_username}')
        )
        self.room_group_name = self.room.name

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_type = text_data_json["type"]
        if message_type == "message":
            message = text_data_json["messageContent"]
            sender = text_data_json["sender"]
            time = text_data_json["time"]
            receiver = text_data_json["receiver"]
            message = await self.save_message(sender, message, self.room, time)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message": {
                        "id": message.id,
                        "sender": message.sender.username,
                        "time": time,
                        "content": message.content,
                    },
                    "receiver": receiver,
                },
            )
        if message_type == "seen":
            message_id = text_data_json["id"]
            sender = await self.mark_message_as_read(message_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "seen",
                    "message_sender": sender,
                },
            )

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]
        receiver = event["receiver"]

        # Send the message to the receiver and the sender only.
        if (
            self.scope["user"].username == message["sender"]
            or self.scope["user"].username == receiver
        ):
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "message",
                        "id": message["id"],
                        "content": message["content"],
                        "sender": message["sender"],
                        "time": message["time"],
                    }
                )
            )

    async def seen(self, event):  
        if self.scope["user"].username == event["message_sender"]:
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "seen",
                        "message_sender": event["message_sender"],
                    }
                )
            )

    @sync_to_async
    def save_message(self, username, content, room, timestamp):
        timestamp = (
            timestamp // 1000
        )  # Convert the timestamp to seconds from milliseconds
        time = datetime.datetime.fromtimestamp(timestamp)
        user = USER.objects.get(username=username)
        return Message.objects.create(
            sender=user, room=room, content=content, time=time
        )

    @sync_to_async
    def mark_message_as_read(self, id):
        message = Message.objects.filter(id=id)
        message.update(status="read")
        return message[0].sender.username
