from channels.generic.websocket import AsyncWebsocketConsumer

class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("friend request connected")
        await self.accept()
        
    async def receive(self, text_data):
        pass