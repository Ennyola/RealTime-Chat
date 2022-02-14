from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Room, Message, Participants
from django.contrib.auth.decorators import login_required

# Create your views here.

@login_required
def index(request):
    friend_list =Participants.get_friends(request.user)
    context = {
        'friends': friend_list,
    }
    return render(request, 'chat/index.html', context)

@login_required
def chat_room(request, room_id):
    messages = Message.objects.filter(room_id=room_id)
    friend_list =Participants.get_friends(request.user)
    room = Room.objects.get(id=room_id)
    
    #get room name which is the name of the person you're chatting with 
    if room.name.startswith(request.user.username):
        room_name=room.name.split("_")[1]
    else:
        room_name=room.name.split("_")[0]
    context = {
        'messages': messages,
        'room_name': room_name,
        'friends': friend_list,
    }
    return render(request, 'chat/chat-room.html', context)
