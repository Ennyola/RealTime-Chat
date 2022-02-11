from django.shortcuts import render
from django.contrib.auth.models import User
from django.http import HttpResponse
from .models import Room, Message, Participants, Friends
# Create your views here.


def index(request):
    friends = Participants.objects.all()
    friend_list = []
    for friend in friends:
        room_id = friend.room.id
        room_name = friend.room.name.split("_")[1]
        friend_list.append({
            'room_id': room_id,
            'room_name': room_name
        })
    context = {
        'friends': friend_list,
    }
    return render(request, 'chat/index.html', context)


def chat_room(request, room_id):
    messages = Message.objects.filter(room_id=room_id)
    room = Room.objects.get(id=room_id)
    if room.name.startswith(request.user.username):
        room_name=room.name.split("_")[1]
    context = {
        'messages': messages,
        'room_name': room_name
    }
    return render(request, 'chat/chat-room.html', context)
