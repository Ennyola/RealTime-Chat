import random
from django.shortcuts import redirect, render
from django.contrib.auth.models import User
from.models import Friends
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
    Friends.objects.create(friend=friend)
    return redirect('find_friends:index')

def show_friends(request):
    friends=Friends.objects.all()
    context={
        "friends":friends
    }
    
    return render(request,'find_friends/show_friends.html',context)
