from django.contrib import admin

from .models import Friendship, FriendRequest

# Register your models here.

@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("from_user", "to_user", "status")
    
@admin.register(FriendRequest)
class FriendshipRequestAdmin(admin.ModelAdmin):
    list_display = ("from_user", "to_user", "message", "created_at")