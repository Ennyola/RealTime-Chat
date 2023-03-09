from itertools import groupby

from django.shortcuts import redirect, render
from django.contrib.auth import get_user_model
from django.db.models import Q

from chat.models import Participants, Room

from .models import FriendRequest, Friendship

# Create your views here.

User = get_user_model()


def change_friendship_status(queryset, status):
    frienship = queryset[0]
    frienship.status = status
    frienship.save()


def index(request):
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
    ).order_by("?")[:10]

    recipients = User.objects.filter(friend_requests_received__in=sent_friend_requests)
    senders = User.objects.filter(
        friend_requests_sent__in=received_friend_requests
    ).order_by("-friend_requests_sent__created_at")
    loop_count = range(2)
    context = {
        "random_users": users,
        "friend_requests": senders,
        "recipients": recipients,
        "loop_count": loop_count,
    }
    return render(request, "find_friends/add-friend.html", context)


def send_or_cancel_request(request, id):
    potential_friend = User.objects.get(id=id)
    friendship = Friendship.objects.filter(
        from_user=request.user, to_user=potential_friend
    )
    if "send-request" in request.POST:
        # Send friend request
        FriendRequest.objects.create(from_user=request.user, to_user=potential_friend)
        # check if the friendship already exists. If it does, update the status to pending
        if friendship.exists():
            change_friendship_status(friendship, "PND")
        else:
            Friendship.objects.create(
                from_user=request.user, to_user=potential_friend, status="PND"
            )
    if "cancel-request" in request.POST:
        # Cancel friend request
        FriendRequest.objects.filter(
            from_user=request.user, to_user=potential_friend
        ).delete()
        # Since the friendship already exists, update the status to cancelled
        change_friendship_status(friendship, "CNC")
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
        participants = Participants.objects.create(room=room)
        participants.users.add(request.user, potential_friend)

    if "reject-request" in request.POST:
        # Delete friend request
        FriendRequest.objects.filter(
            from_user=potential_friend, to_user=request.user
        ).delete()
        Friendship.objects.filter(
            from_user=potential_friend, to_user=request.user
        ).update(status="REJ")
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
    # Grouping the friends by the first letter of their name
    grouped_friends = groupby(friends, lambda x: x.username[0])
    friend_groups = [
        {"alphabet": alphabet, "friends": list(friends)}
        for alphabet, friends in grouped_friends
    ]

    friends_and_room_id = []
    for friends in friend_groups:
        for friend in friends["friends"]:
            # Getting the room id the user and friend shares
            room = Room.objects.filter(
                Q(name=f"{friend.username}_{request.user}")
                | Q(name=f"{request.user}_{friend.username}")
            ).values("id")
            friends_and_room_id.append({"user": friend, "room_id": room[0].get("id")})
        # Deleting the friends dictionary used in getting the room id to avoid redundant data
        del friends["friends"]
        friends["friend_and_room_id"] = friends_and_room_id
        friends_and_room_id = []
    context = {
        "friend_groups": friend_groups,
    }

    return render(request, "find_friends/show_friends.html", context)
