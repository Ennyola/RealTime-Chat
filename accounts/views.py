from django.shortcuts import redirect, render
from django.contrib.auth import login,authenticate,logout
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