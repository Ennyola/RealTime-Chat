from email import message
from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Room, Message, Participants, Friends
# Create your views here.


def index(request):
    friends = Participants.objects.all()
    friend_list = []
    for friend in friends:
        room_id=friend.room.id
        room_name = friend.room.name.split("_")[1]
        friend_list.append({
            'room_id':room_id,
            'room_name':room_name
        })
    # room = Room.objects.get(name="Ennyola_eny")
    # messages = Message.objects.filter(room=room)
    context = {
        'friends': friend_list,
        # 'messages': messages
    }
    return render(request, 'chat/index.html', context)

def chat_room(request,room_id):
    print("hi")