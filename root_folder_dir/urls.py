from django.contrib import admin
from django.urls import path, include
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.conf.urls.static import static

from chat.views import ChatIndexView

from find_friends.views import show_friends
from accounts.views import user_profile

urlpatterns = [
    path("", login_required(ChatIndexView.as_view()), name="homepage"),
    path("accounts/", include("accounts.urls", namespace="accounts")),
    path("add-friend/", include("find_friends.urls", namespace="find_friends")),
    path("friends/", login_required(show_friends), name="friends"),
    path("admin/", admin.site.urls),
    path("chat/", include("chat.urls", namespace="chat")),
    path("<str:username>/", user_profile, name="user_profile"),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
