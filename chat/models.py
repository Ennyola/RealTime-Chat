from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Room(models.Model):
    name = models.CharField(max_length=500)

    def __str__(self):
        return self.name


class Participants(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    content = models.TextField()
    time = models.DateTimeField(auto_now=True)
    type = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return self.content
