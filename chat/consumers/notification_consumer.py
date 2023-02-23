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
        print(event)
        if self.scope["user"].username == event["to_user"]:
            await self.send(
                json.dumps({
                    "type":"cancel_friend_request",
                    "from": event["from_user"],
                    "to": event["to_user"] 
                })
            )
