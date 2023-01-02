from django.db import models
from django.conf import settings

# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    about = models.TextField(blank=True)
    display_picture = models.ImageField(upload_to="profile_pictures", blank=True)

    def __str__(self):
        return self.user.username
