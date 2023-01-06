from django.forms import ModelForm

from .models import UserProfile

class UploadImageForm(ModelForm):
    class Meta:
        model = UserProfile
        fields = ['display_picture']
        
