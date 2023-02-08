import random

from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model

from chat.models import Participants, Room

from .models import FriendRequest, Friendship

# Create your views here.

User = get_user_model()


def index(request):

    users = list(User.objects.all().exclude(username=request.user))
    # Getting all the friend requests sent to the current user
    friend_requests = FriendRequest.objects.filter(to_user=request.user)
    
    sent_friend_requests = FriendRequest.objects.filter(from_user=request.user)
    recipients = User.objects.filter(friend_requests_received__in=sent_friend_requests)
    count = len(users)
    if count < 10:
        random_five = random.sample(users, count)
    else:
        random_five = random.sample(users, 10)
    context = {"random_users": random_five, "friend_requests": friend_requests, "recipients": recipients}
    return render(request, "find_friends/add-friend.html", context)


def send_or_cancel_request(request, id):
    potential_friend = User.objects.get(id=id)
    friend_request = FriendRequest.objects.create(
        from_user=request.user, to_user=potential_friend
    )
    pending_friendship = Friendship.objects.create(
        from_user=request.user, to_user=potential_friend, status="PND"
    )
    # FriendRequest.objects.filter(to_user=request.user, from_user__in=users).delete()
    return redirect("find_friends:index")
    # Check if a room already exists.
    # if (
    #     Room.objects.filter(name=f"{friend.username}_{request.user}").exists()
    #     or Room.objects.filter(name=f"{request.user}_{friend.username}").exists()
    # ):
    #     print("User already added")
    # else:
    #     room = Room.objects.create(name=f"{request.user}_{friend.username}")
    #     Participants.objects.create(user=request.user, room=room)
    #     Participants.objects.create(user=friend, room=room)
    # return redirect("find_friends:index")


def show_friends(request):
    friend_list = Participants.get_friends(request.user)
    context = {
        "friends": friend_list,
    }

    return render(request, "find_friends/show_friends.html", context)
