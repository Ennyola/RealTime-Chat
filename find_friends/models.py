from operator import mod
from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Friends(models.Model):
    friend = models.ForeignKey(User, on_delete=models.CASCADE)
   
    def __str__(self):
        return self.friend.username
    