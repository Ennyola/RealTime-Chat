import json

from channels.generic.websocket import AsyncWebsocketConsumer

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("notifications", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("notifications", self.channel_name)

    async def notify_user(self, event):
        # This sends the websocket message to two clients. The sender and the receiver.
        if self.scope["user"].username == event["receiver"]:
            await self.send(
                json.dumps(
                    {
                        "type": "new_message",
                        "sender": event["sender"],
                        "receiver": event["receiver"],
                        "message": event["message"],
                        "room_id": event["room_id"],
                    }
                )
            )
        else:
            await self.send(
                json.dumps(
                    {
                        "type": "new_message",
                        "receiver": event["receiver"],
                        "message": event["message"],
                        "room_id": event["room_id"],
                    }
                )
            )

