from django.shortcuts import render, redirect, get_object_or_404
from django.template import RequestContext
from django.contrib.auth import login
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth import logout
from django.contrib.auth.hashers import check_password
from django.utils import timezone
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
from teacher.models import *

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
    if user.is_authenticated and user.position == 0:
        content = {'username': mark_safe(json.dumps(user.username)),}
        return render(request, 'student/base.html', content)
    else:
        return HttpResponseRedirect('/')


def home(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        content = {'username': mark_safe(json.dumps(user.username)),}
        return render(request, 'student/base.html', content)
    else:
        return HttpResponseRedirect('/')


def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def user_profile(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        if request.method == 'POST':
            if 'fullname' in request.POST:
                if check_password(request.POST['password'], user.password):
                    user.fullname = request.POST['fullname']
                    user.email = request.POST['email']
                    if 'nu' in request.POST:
                        user.gioi_tinh = 0
                    else:
                        user.gioi_tinh = 1
                    user.save()
                    messages.success(request, "Cập nhật thành công")
                else:
                    messages.warning(request, 'Mật khẩu không đúng')
            else:
                if check_password(request.POST['pass1'], user.password):
                    user.set_password(request.POST['pass2'])
                    user.save()
                    messages.success(request, "Cập nhật thành công")
                else:
                    messages.warning(request, 'Mật khẩu không đúng')
            return HttpResponseRedirect("profile")
        content = {'username': mark_safe(json.dumps(user.username)), 'lop': ChiTietLop.objects.get(myuser_id=user)}
        return render(request, 'student/profile.html', content)
    else:
        return redirect("/")