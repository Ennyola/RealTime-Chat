from tkinter.font import ROMAN
from django.contrib import admin
from .models import Room, Message, Participants
# Register your models here.


admin.site.register(Room)
admin.site.register(Message)
admin.site.register(Participants)


class MessageAdmin(admin.ModelAdmin):
    list_view = ['user', 'message', 'time', 'status']
