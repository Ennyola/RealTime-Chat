from django.shortcuts import redirect, render
from django.contrib.auth import login,authenticate,logout
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

# Create your views here.

def user_login(request):
    username = request.POST.get('username',None)
    password = request.POST.get('password',None)
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request,user)
        return redirect("homepage")
    return render(request, 'accounts/login.html')

def user_logout(request):
    logout(request)
    return redirect("accounts:login")

def user_profile(request,username):
    user = get_object_or_404(User,username=username)
    return render(request, "accounts/user_profile.html")