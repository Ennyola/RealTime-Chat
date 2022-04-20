from django.urls import path
from .views import index

app_name="find_friends"
urlpatterns = [
    path('', index,name="add-friend")
]
