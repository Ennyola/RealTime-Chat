from django import forms

from .models import UserProfile

class UploadImageForm(forms.ModelForm):
    bio = forms.CharField(max_length=300, required=False)
    class Meta:
        model = UserProfile
        fields = ['display_picture','bio']
        
    def save(self, commit=False):
        userprofile = self.instance
        print(self.cleaned_data['bio'])
        if self.cleaned_data['bio'] is not None:
            userprofile.bio = self.cleaned_data['bio']
        if self.cleaned_data['display_picture'] is not None:
            userprofile.display_picture = self.cleaned_data['display_picture']
        userprofile.save()
        return userprofile
        
        
