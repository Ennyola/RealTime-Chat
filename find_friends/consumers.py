from channels.generic.websocket import AsyncWebsocketConsumer

class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("friend request connected")
        await self.accept()
        await self.channel_layer.group_add("friend_requests", self.channel_name)
        
    async def receive(self, text_data):
        print("friend request received")
        await self.channel_layer.group_send(
            "friend_requests",
            {
                "type": "friend_request",
                "message": text_data,
            },
        )
