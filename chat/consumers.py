import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from .models import Message, Room, Participants


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connection Established")
        self.user_name = self.scope["url_route"]["kwargs"]["username"]
        self.friend = await sync_to_async(User.objects.get)(username=self.user_name)
        self.does_room_exist = await self.check_if_room_exists(
            self.scope["user"], self.friend
        )
        if not self.does_room_exist:
            # The room_group name starts with the name of the user and that of the person he/she is chatting with
            # e.g currentUser_myfriend
            self.room_group_name = f'{self.scope["user"]}_{self.user_name}'
            self.room, created = await self.create_room(self.room_group_name)
            self.create_room_for_user, created = await self.create_participants(
                self.scope["user"], self.room
            )
            # A similar room is created for the friend with same room_group name
            self.create_room_for_friend, created = await self.create_participants(
                self.friend, self.room
            )
        else:
            self.room = await sync_to_async(Room.objects.get)(
                name=f'{self.user_name}_{self.scope["user"]}'
            )
            self.room_group_name = self.room.name
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json["type"] == "message":
            message = text_data_json["messageContent"]
            sender = text_data_json["sender"]
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "chat_message", "message": message, "sender": sender},
            )
        else:
            if text_data_json["type"] == "video-offer":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "video_offer",
                        "msg_type": text_data_json["type"],
                        "caller": text_data_json["caller"],
                        "target": text_data_json["target"],
                        "sdp": text_data_json["sdp"],
                    },
                )
            if text_data_json["type"] == "video-answer":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "video_answer",
                        "msg_type": text_data_json["type"],
                        "caller": text_data_json["caller"],
                        "target": text_data_json["target"],
                        "sdp": text_data_json["sdp"],
                    },
                )
            if text_data_json["type"] == "new-ice-candidate":
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "new_ice_candidate",
                        "msg_type": text_data_json["type"],
                        "target": text_data_json["target"],
                        "candidate": text_data_json["candidate"],
                    },
                )

                # await self.send(json.dumps(text_data_json))

    # Receive message from room group
    async def chat_message(self, event):
        message = event["message"]
        sender = event["sender"]
        # If the currently logged in user is not the sender, do not save the message sent to the server
        if self.scope["user"].username == sender.strip('"'):
            await self.save_message(self.scope["user"], message, self.room)
        # Send message to WebSocket
        await self.send(
            text_data=json.dumps(
                {"type": "message", "message_content": message, "sender": sender}
            )
        )

    async def video_offer(self, event):
        if self.scope["user"].username != event["caller"].strip('"'):
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "caller": event["caller"],
                        "target": event["target"],
                        "sdp": event["sdp"],
                    }
                )
            )

    async def video_answer(self, event):
        if self.scope["user"].username != event["caller"].strip('"'):
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "caller": event["caller"],
                        "target": event["target"],
                        "sdp": event["sdp"],
                    }
                )
            )
    async def new_ice_candidate(self, event):
        if self.scope["user"].username == event["target"].strip('"'):
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "target": event["target"],
                        "candidate": event["candidate"],
                    }
                )
            )

    @sync_to_async
    def save_message(self, user, content, room):
        Message.objects.create(sender=user, room=room, content=content)

    @sync_to_async
    def create_room(self, room_name):
        return Room.objects.get_or_create(name=room_name)

    @sync_to_async
    def create_participants(self, user, room_name):
        return Participants.objects.get_or_create(user=user, room=room_name)

    @sync_to_async
    def check_if_room_exists(self, user, friend):
        return Room.objects.filter(name=f"{friend}_{user}").exists()
