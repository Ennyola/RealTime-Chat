import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from .models import Message, Room, Participants


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connection Established")
        self.user_name = self.scope['url_route']['kwargs']['username']
        self.room_group_name = f'{self.scope["user"]}_{self.user_name}'
        self.room, created = await self.create_room(self.room_group_name)
        self.participants, created = await self.create_participants(self.scope['user'], self.room)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    # Receive message from room group
    async def chat_message(self, event):
        message = event['message']
        await self.save_message(self.scope['user'], message, self.room)
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

    @sync_to_async
    def save_message(self, user, content, room):
        Message.objects.create(sender=user, room=room, content=content)

    @sync_to_async
    def create_room(self, room_name):
        return Room.objects.get_or_create(name=room_name)

    @sync_to_async
    def create_participants(self, user, room_name):
        return Participants.objects.get_or_create(user=user, room=room_name)
