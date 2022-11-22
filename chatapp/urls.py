"""chatapp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from django.contrib.auth.decorators import login_required

from chat.views import ChatIndexView
from find_friends.views import show_friends

urlpatterns = [
    path('',login_required(ChatIndexView.as_view()), name="homepage"),
    path('accounts/',include('accounts.urls')),
    path('add-friend/', include('find_friends.urls')),
    path('admin/', admin.site.urls),
    path('chat/',include('chat.urls', namespace="chat")),
    path('friends/', show_friends, name="friends" )
]
