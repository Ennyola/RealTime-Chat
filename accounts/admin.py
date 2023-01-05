from django.contrib import admin
from django.conf import settings
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import UserProfile

# Register your models here.


class UserProfileAdmin(admin.StackedInline):
    model = UserProfile


class NewUserAdmin(UserAdmin):
    inlines = [UserProfileAdmin]
    list_display = [
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_active",
        "is_superuser",
        "last_login",
        "date_joined",
        "get_bio",
        "get_image"
    ]
    
    def get_bio(self, obj):
        return obj.userprofile.bio
    
    def get_image(self, obj):
        return obj.userprofile.display_picture


admin.site.unregister(User)
admin.site.register(User, NewUserAdmin)
