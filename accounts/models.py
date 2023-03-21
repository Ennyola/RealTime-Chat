from django.db import models
from django.contrib.auth import get_user_model

from django.contrib.staticfiles.storage import staticfiles_storage

# Create your models here.

USER = get_user_model()
class UserProfile(models.Model):
    user = models.OneToOneField(
        USER,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="userprofile",
    )
    bio = models.TextField(blank=True)
    display_picture = models.ImageField(
        upload_to="profile_pictures",
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.bio} by {self.user.username}"

    @property
    def get_image(self):
        """
        Returns the display picture of the user or the default image
        if the user has not uploaded a display picture.
        """
        if not self.display_picture:
            return staticfiles_storage.url("accounts/img/user-image.png")
        else:
            return self.display_picture.url
