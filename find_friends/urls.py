from django.urls import path
from .views import index, send_or_cancel_request, accept_or_delete_request

app_name = "find_friends"
urlpatterns = [
    path("", index, name="index"),
    path("<int:id>/send-or-cancel/", send_or_cancel_request, name="send_or_cancel_request"),
    path("<int:id>/accept-or-reject/", accept_or_delete_request, name="accept_or_delete_request"),
]
