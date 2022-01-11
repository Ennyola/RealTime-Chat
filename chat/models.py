from django.core.checks import messages
from django.db import models
from django.contrib.auth.models import User
# Create your models here.


class Room(models.Model):
    name=models.CharField(max_length=500)
    _type=models.BooleanField()
    

class Participants(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room =  models.ForeignKey(Room, on_delete=models.CASCADE)
    
class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room =  models.ForeignKey(Room, on_delete=models.CASCADE)
    message = models.TextField()