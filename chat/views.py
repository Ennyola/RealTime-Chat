from django.shortcuts import render
from django.views import View
from django.contrib.auth.decorators import login_required

from .models import Room, Message, Participants
from .helpers import get_room_name

# Create your views here.

class ChatIndexView(View):
    
    def get(self,request,*args,**kwargs):
        friend_list = Participants.get_friends(request.user)
        context = {
            "friends": friend_list,
        }
        return render(request, "chat/index.html", context)


class ChatRoomView(View):
    pass

@login_required
def chat_room(request, room_id):
    messages = Message.objects.filter(room_id=room_id)
    friend_list = Participants.get_friends(request.user)
    room = Room.objects.get(id=room_id)

    context = {
        "messages": messages,
        "room_name": get_room_name(room.name, request.user.username),
        "friends": friend_list,
    }
    return render(request, "chat/chat-room.html", context)
