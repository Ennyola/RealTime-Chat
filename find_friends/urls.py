from django.urls import path
from .views import index, send_or_cancel_request

app_name = "find_friends"
urlpatterns = [
    path("", index, name="index"),
    path("<int:id>/add/", send_or_cancel_request, name="send_or_cancel_request"),
]
