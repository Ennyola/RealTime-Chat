import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from .models import Message, Room


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connection Established")
        self.user_name = self.scope['url_route']['kwargs']['username']
        print(self.scope['url_route'])
        self.room_group_name = f'chat_{self.user_name}'

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
        self.room = await sync_to_async(Room.objects.create)(name=self.room_group_name, _type=True)
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
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))
