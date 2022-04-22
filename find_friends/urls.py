from django.urls import path
from .views import index,add_friend

app_name="find_friends"
urlpatterns = [
    path('', index,name="index"),
    path('<int:id>/add/', add_friend,name="add_friend")
]
