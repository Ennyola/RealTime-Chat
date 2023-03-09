from django.shortcuts import redirect, render
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib import messages

from .models import UserProfile
from .forms import LoginForm, RegisterForm, UpdateProfileForm


# Create your views here.


def register(request):
    form = RegisterForm()
    
    context = {"form": form}
    return render(request, "accounts/registration.html", context)


def user_login(request):
    if request.method == "POST":
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password"]
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect("homepage")
            else:
                messages.error(
                    request, "Invalid credentials. Are you sure you are signed up?"
                )
    form = LoginForm()
    context = {"form": form}
    return render(request, "accounts/login.html", context)


def user_logout(request):
    logout(request)
    return redirect("accounts:login")


def user_profile(request, username):
    user = get_object_or_404(get_user_model(), username=username)
    profile = UserProfile.objects.get(user=user)
    # Uploads and saves a users display picture.
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
        form = UpdateProfileForm(initial={"bio": profile.bio})
    context = {"user": user, "form": form}
    return render(request, "accounts/user_profile.html", context)
