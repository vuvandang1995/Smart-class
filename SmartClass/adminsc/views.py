from django.shortcuts import render, redirect, get_object_or_404
from django.template import RequestContext
from django.contrib.auth import login
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth import logout
import uuid
import random

from django.utils.safestring import mark_safe
import json
from django.contrib.auth.models import User
import threading
from teacher.forms import UserForm, authenticate, UserResetForm, get_email, ResetForm
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
from django.core.mail import EmailMessage
from teacher.models import MyUser

from django.contrib import messages


class EmailThread(threading.Thread):
    def __init__(self, email):
        threading.Thread.__init__(self)
        self._stop_event = threading.Event()
        self.email = email

    def run(self):
        self.email.send()


def home(request):
    user = request.user
    if user.is_authenticated:
        return render(request, 'adminsc/index.html', {'username': mark_safe(json.dumps(user.username)),})
    else:
        return HttpResponseRedirect('/')


def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def user_profile(request):
    user = request.user
    return render(request, 'adminsc/profile.html', {'username': mark_safe(json.dumps(user.username))})