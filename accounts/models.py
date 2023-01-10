from django.db import models
from django.conf import settings

# Create your models here.


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True, related_name="userprofile")
    bio = models.TextField(blank=True)
    display_picture = models.ImageField(upload_to="profile_pictures", blank=True, null=True)

    def __str__(self):
        return f"{self.bio} by {self.user.username}"
