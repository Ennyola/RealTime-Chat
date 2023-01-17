from django.shortcuts import redirect, render
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import UserProfile
from .forms import UpdateProfileForm


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
    # Uploads and saves a users display picture.
    print(request.POST, request.FILES)
    if request.method == "POST" and request.FILES:
        form = UpdateProfileForm(request.POST, request.FILES)
        if form.is_valid():
            profile.display_picture = form.cleaned_data["display_picture"]
            profile.save()
            return redirect("user_profile", username=user.username)
        
    # When the user submits the form, the form is validated and the bio is updated.
    elif request.method == "POST" and "bio" in request.POST:
        form = UpdateProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            return redirect("user_profile", username=user.username)
        
    # When the user submits the form, the form is validated and the display picture is deleted.
    elif request.method == "POST" and "delete_photo" in request.POST:
        form = UpdateProfileForm(request.POST)
        if form.is_valid():
            profile.display_picture.delete()
            return redirect("user_profile", username=user.username)
    else:
        form = UpdateProfileForm()
    context = {"user": user, "form": form}
    return render(request, "accounts/user_profile.html", context)
