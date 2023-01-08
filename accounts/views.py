from django.shortcuts import redirect, render
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import UserProfile
from .forms import UploadImageForm


# Create your views here.


def user_login(request):
    username = request.POST.get("username", None)
    password = request.POST.get("password", None)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return redirect("homepage")
    return render(request, "accounts/login.html")


def user_logout(request):
    logout(request)
    return redirect("accounts:login")


def user_profile(request, username):
    user = get_object_or_404(get_user_model(), username=username)
    profile = UserProfile.objects.get(user=user)
    if request.method == "POST" and "delete_photo" not in request.POST:
        form = UploadImageForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect("user_profile", username=user.username)
    elif request.method == "POST" and "delete_photo" in request.POST:
        form = UploadImageForm(request.POST)
        if form.is_valid():
            profile.display_picture.delete()
            return redirect("user_profile", username=user.username)
    else:
        form = UploadImageForm()
    context = {"user": user, "form": form}
    return render(request, "accounts/user_profile.html", context)
