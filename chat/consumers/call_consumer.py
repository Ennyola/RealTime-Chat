import json

from channels.generic.websocket import AsyncWebsocketConsumer


class CallConsumer(AsyncWebsocketConsumer):
    async def connect(self) -> None:
        await self.accept()
        await self.channel_layer.group_add("calls", self.channel_name)

    async def disconnect(self, close_code) -> None:
        await self.channel_layer.group_discard("calls", self.channel_name)

    async def receive(self, text_data: str, bytes_data: bytes = None) -> None:
        text_data_json = json.loads(text_data)
        if text_data_json["type"] == "offer":
            await self.channel_layer.group_send(
                "calls",
                {
                    "type": "offer",
                    "msg_type": text_data_json["type"],
                    "caller": text_data_json["caller"],
                    "target": text_data_json["target"],
                    "caller_picture": text_data_json.get("callerPicture"),
                    "sdp": text_data_json["sdp"],
                },
            )
        if text_data_json["type"] == "answer":
            await self.channel_layer.group_send(
                "calls",
                {
                    "type": "answer",
                    "msg_type": text_data_json["type"],
                    "caller": text_data_json["caller"],
                    "target": text_data_json["target"],
                    "sdp": text_data_json["sdp"],
                },
            )
        if text_data_json["type"] == "new-ice-candidate":
            await self.channel_layer.group_send(
                "calls",
                {
                    "type": "new_ice_candidate",
                    "msg_type": text_data_json["type"],
                    "target": text_data_json["target"],
                    "candidate": text_data_json["candidate"],
                },
            )
        if text_data_json["type"] == "hang-up":
            await self.channel_layer.group_send(
                "calls",
                {
                    "type": "hang_up",
                    "msg_type": text_data_json["type"],
                    "target": text_data_json["target"],
                    "name": text_data_json["name"],
                },
            )
        if text_data_json["type"] == "ringing":
            await self.channel_layer.group_send(
                "calls",
                {
                    "type": "ringing",
                    "msg_type": text_data_json["type"],
                    "target": text_data_json["target"],
                    "caller": text_data_json["caller"],
                },
            )

    async def offer(self, event):
        # If caller is not the currently logged in user, send the offer to the user.
        if self.scope["user"].username == event["target"]:
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "caller": event["caller"],
                        "target": event["target"],
                        "caller_picture": event["caller_picture"],
                        "sdp": event["sdp"],
                    }
                )
            )

    async def answer(self, event):
        if self.scope["user"].username == event["target"]:
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
        if self.scope["user"].username == event["target"]:
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "target": event["target"],
                        "candidate": event["candidate"],
                    }
                )
            )

    async def hang_up(self, event):
        if self.scope["user"].username == event["target"]:
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "target": event["target"],
                        "name": event["name"],
                    }
                )
            )

    async def ringing(self, event):
        if self.scope["user"].username == event["target"]:
            await self.send(
                json.dumps(
                    {
                        "type": event["msg_type"],
                        "target": event["target"],
                        "caller": event["caller"],
                    }
                )
            )
