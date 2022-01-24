from email import message
from django.shortcuts import render
from django.contrib.auth.models import User
from .models import Room, Message, Participants
# Create your views here.


def index(request):
    friends = Participants.objects.all()
    room = Room.objects.get(name="Ennyola_eny")
    messages = Message.objects.filter(room=room)
    context = {
        'friends': friends,
        'messages': messages
    }
    return render(request, 'chat/index.html', context)
