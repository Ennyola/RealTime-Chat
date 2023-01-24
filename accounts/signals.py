from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .models import UserProfile

USER = get_user_model()


@receiver(post_save, sender=USER)
def create_user_profile(sender, **kwargs):
    if kwargs["created"]:
        UserProfile.objects.create(user=kwargs["instance"])
    else:
        kwargs["instance"].userprofile.save()
