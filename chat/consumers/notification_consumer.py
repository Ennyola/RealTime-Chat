import json

from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("notifications", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def new_message(self, event):
        # This sends the websocket message to two clients. The receiver first and the sender.
        if self.scope["user"].username == event["receiver"]:
            await self.send(
                json.dumps(
                    {
                        "type": "new_message",
                        "sender": event["sender"],
                        "receiver": event["receiver"],
                        "message": event["message"],
                        "message_time":event["message_time"],
                        "room_id": event["room_id"],
                        "sender_image":event["sender_image"]
                    }
                )
            )
        if self.scope["user"].username == event["sender"]:
            await self.send(
                json.dumps(
                    {
                        "type": "new_message",
                        "receiver": event["receiver"],
                        "message": event["message"],
                        "message_time":event["message_time"],
                        "room_id": event["room_id"],
                    }
                )
            )

    async def friend_request(self, event):
        # Send friend requst to the receiver
        if self.scope["user"].username == event["receiver"]:
            await self.send(
                json.dumps(
                    {
                        "type": "friend_request",
                        "sender_id": event["sender_id"],
                        "sender": event["sender"],
                        "receiver": event["receiver"],
                        "sender_avatar": event["sender_avatar"],
                    }
                )
            )
    async def cancel_friend_request(self, event):
        if self.scope["user"].username == event["to_user"]:
            await self.send(
                json.dumps({
                    "type":"cancel_friend_request",
                    "from": event["from_user"],
                    "to": event["to_user"] 
                })
            )
    async def new_room(self, event):
        if self.scope["user"].username == event["other_user"]["username"]:
           await self.send(
                json.dumps(
                    {
                        "type": "new_room",
                        "room_id": event["room_id"],
                        "room_name": event["created_by"]["username"],
                        "room_image": event["created_by"]["image"],
                    }
                )
            )
        if self.scope["user"].username == event["created_by"]["username"]:
            await self.send(
                json.dumps(
                    {
                        "type": "new_room",
                        "room_id": event["room_id"],
                        "room_name": event["other_user"]["username"],
                        "room_image": event["other_user"]["image"],
                    }
                )
            )
    
    