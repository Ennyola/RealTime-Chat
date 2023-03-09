from django.urls import path
from django.contrib.auth.decorators import login_required

from .views import index, send_or_cancel_request, accept_or_reject_request

app_name = "find_friends"
urlpatterns = [
    path("", login_required(index), name="index"),
    path(
        "<int:id>/send-or-cancel/",
        login_required(send_or_cancel_request),
        name="send_or_cancel_request",
    ),
    path(
        "<int:id>/accept-or-reject/",
        login_required(accept_or_reject_request),
        name="accept_or_reject_request",
    ),
]
