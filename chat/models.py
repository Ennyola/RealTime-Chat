from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
# Create your models here.

class Room(models.Model):
    name = models.CharField(max_length=500)

    def __str__(self):
        return self.name


class Participants(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return self.room.name
    
    @staticmethod
    def get_friends(user):
        friends = Participants.objects.filter(user=user)
        friend_list = []
        for friend in friends:
            room_id = friend.room.id
            #Setting the room name to be the name of the friend
            if friend.room.name.startswith(user.username):
                room_name=friend.room.name.split("_")[1]
            else:
                room_name=friend.room.name.split("_")[0]
            friend_list.append({
                'room_id': room_id,
                'room_name': room_name
            })
        return friend_list


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    content = models.TextField()
    time = models.DateTimeField(default=timezone.localtime)
    type = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.content
