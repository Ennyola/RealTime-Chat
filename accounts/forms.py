from django import forms

from .models import UserProfile


class UpdateProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ["display_picture", "bio"]
        widgets = {
            "bio": forms.TextInput(),
        }

        

    def save(self):
        userprofile = self.instance
        print(self.cleaned_data["bio"])
        if self.cleaned_data["bio"] is not None:
            userprofile.bio = self.cleaned_data["bio"]
        if self.cleaned_data["display_picture"] is not None:
            userprofile.display_picture = self.cleaned_data["display_picture"]
        userprofile.save()
        return userprofile
