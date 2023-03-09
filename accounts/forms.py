from django import forms
from django.utils.translation import gettext_lazy as _

from .models import UserProfile


class RegisterForm(forms.Form):
    username = forms.CharField(label=_("Username"), max_length=100, widget=forms.TextInput(attrs={"placeholder": "Username"}))
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput)
    confirm_password = forms.CharField(label=_("Confirm Password"), widget=forms.PasswordInput(attrs={"placeholder": "Confirm Password"}))

class LoginForm(forms.Form):
    username = forms.CharField(label=_("Username"), max_length=100, widget=forms.TextInput(attrs={"placeholder": "Username","class":"form-control"}))
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput(attrs={"placeholder": "Password","class":"form-control"}))

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

