import random
from django.shortcuts import redirect, render
from django.contrib.auth.models import User
from chat.models import Participants,Room
# Create your views here.


def index(request):
    users = list(User.objects.all().exclude(username=request.user))
    count = len(users)
    if count < 10:
        random_five = random.sample(users,count)
    else:
        random_five = random.sample(users,10)
    context={
        "random_users":random_five
    }
    return render(request, 'find_friends/add-friend.html',context)

def add_friend(request,id):
    friend = User.objects.get(id=id)
    # Check if a room already exists.
    if Room.objects.filter(name=f'{friend.username}_{request.user}').exists() or Room.objects.filter(name=f'{request.user}_{friend.username}').exists():
        print("User already added")
    else:
        room = Room.objects.create(name=f'{request.user}_{friend.username}')
        Participants.objects.create(user=request.user,room=room)
        Participants.objects.create(user=friend,room=room)
    return redirect('find_friends:index')

def show_friends(request):
    friend_list =Participants.get_friends(request.user)
    context = {
        'friends': friend_list,
    }
    
    return render(request,'find_friends/show_friends.html',context)
