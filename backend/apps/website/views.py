from django.shortcuts import render, redirect
from .models import User
from .forms import UserForm
from django.contrib import messages

def home(request):
    all_mems = User.objects.all
    return render(request, 'home.html', {'all': all_mems})

"""
join: handles a form where one can enter user info and add it to the db, just used for testing
@requst: handles GET and POST requests for user registration/input
@return; render to template that displays a user form that will send the info to the db if valid
"""
def join(request):
    if request.method == 'POST':
        form = UserForm(request.POST or None)
        if form.is_valid():
            form.save()
        else:
            username = request.POST['username']
            email = request.POST['email']
            passwd = request.POST['password']
            messages.success(request, 'There was an error in your form. Please try again')
            return render(request, 'join.html', {'username':username, 'email':email, 'password':passwd})
        messages.success(request, ('Your form has been submitted successfully!'))
        return redirect('home')
    else:
        return render(request, 'join.html', {})