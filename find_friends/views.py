import random

from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model
from django.db.models import Q, Count

from chat.models import Participants, Room

from .models import FriendRequest, Friendship

# Create your views here.

User = get_user_model()


def index(request):
    # Getting all the friend requests sent to the current user
    sent_friend_requests = FriendRequest.objects.filter(from_user=request.user)
    received_friend_requests = FriendRequest.objects.filter(to_user=request.user)
    # Getting all the friendships that the current user has
    friend_list = Friendship.objects.filter(
        Q(Q(from_user=request.user) | Q(to_user=request.user)) & Q(status="ACC")
    )
    # This ensures the current user, the users that have sent a friend request,
    # and the users that are already friends are not
    # shown in the list of people to be added
    # It also orders them by adding the sent requests to the top of the list and
    # randomly orders the remaining users
    users = User.objects.exclude(
        Q(username=request.user)
        | Q(friend_requests_sent__in=received_friend_requests)
        | Q(friendships_received__in=friend_list)
        | Q(friendships_sent__in=friend_list)
    ).order_by("friend_requests_received", "?")[:10]

    recipients = User.objects.filter(friend_requests_received__in=sent_friend_requests)
    senders = User.objects.filter(friend_requests_sent__in=received_friend_requests)
    context = {
        "random_users": users,
        "friend_requests": senders,
        "recipients": recipients,
    }
    return render(request, "find_friends/add-friend.html", context)


def send_or_cancel_request(request, id):
    potential_friend = User.objects.get(id=id)
    if "send-request" in request.POST:
        # Send friend request
        FriendRequest.objects.create(from_user=request.user, to_user=potential_friend)
        Friendship.objects.create(
            from_user=request.user, to_user=potential_friend, status="PND"
        )
    else:
        # Cancel friend request
        FriendRequest.objects.filter(
            from_user=request.user, to_user=potential_friend
        ).delete()
        Friendship.objects.filter(
            from_user=request.user, to_user=potential_friend
        ).delete()
    return redirect("find_friends:index")


def accept_or_reject_request(request, id):
    potential_friend = User.objects.get(id=id)
    if "accept-request" in request.POST:
        # Accept friend request
        Friendship.objects.filter(
            from_user=potential_friend, to_user=request.user
        ).update(status="ACC")
        FriendRequest.objects.filter(
            from_user=potential_friend, to_user=request.user
        ).delete()
        # Create a room for the two users
        room = Room.objects.create(name=f"{request.user}_{potential_friend.username}")
        Participants.objects.create(user=request.user, room=room)
        Participants.objects.create(user=potential_friend, room=room)
    else:
        # Delete friend request
        FriendRequest.objects.filter(
            from_user=potential_friend, to_user=request.user
        ).delete()
    return redirect("find_friends:index")


def show_friends(request):
    # This is a list of all the friendships that the current user has.
    # It goes to the friendship table to filter out all the object that has
    # the current user as either the from_user or the to_user.
    # with the status of accepted. So all pending requests are not fetched4
    friend_list = Friendship.objects.filter(
        Q(Q(from_user=request.user) | Q(to_user=request.user)) & Q(status="ACC")
    )

    # Getting the friend user objects from the friend_list queryset and ordering them alphabetically
    friends = (
        User.objects.filter(
            Q(friendships_received__in=friend_list)
            | Q(friendships_sent__in=friend_list)
        )
        .exclude(username=request.user.username)
        .order_by("username")
    )
    context = {
        "friends": friends,
    }

    return render(request, "find_friends/show_friends.html", context)


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
