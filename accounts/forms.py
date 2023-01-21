from django import forms
from django.utils.translation import gettext_lazy as _

from .models import UserProfile


class UpdateProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["display_picture", "bio"]
        widgets = {
            "bio": forms.TextInput(attrs={"disabled":True}),
        }
        labels = {
            "display_picture": _("Upload Image"),
        }

