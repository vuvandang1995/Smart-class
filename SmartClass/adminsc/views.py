from django.shortcuts import render, redirect, get_object_or_404
from django.template import RequestContext
from django.contrib.auth import login
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth import logout
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
    if user.is_authenticated:
        content = {'username': mark_safe(json.dumps(user.username)),}
        return render(request, 'adminsc/index.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_teacher(request):
    user = request.user
    content = {'username': mark_safe(json.dumps(user.username)),}

    if user.is_authenticated:
        if request.method == 'POST':
            gv = MyUser.objects.create_teacher(email=request.POST['email'],
                                               fullname=request.POST['fullname'],
                                               username=request.POST['username'],
                                               password=request.POST['password'])
            list_mon = request.POST['list_mon']
            list_mon = json.loads(list_mon)
            for mon in list_mon:
                ten, lop = mon.split(" - ")
                GiaoVienMon.object.create(ten=ten, lop=lop, giao_vien_id=gv)
        return render(request, 'adminsc/manage_teacher.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_teacher_data(request):
    user = request.user
    if user.is_authenticated:
        ls_teacher = MyUser.objects.filter(position=1)
        data = []
        for teacher in ls_teacher:
            if teacher.gioi_tinh == 0:
                gioi_tinh = 'Nữ'
            else:
                gioi_tinh = 'Nam'
            if teacher.last_login is not None:
                last_login = str(teacher.last_login + timezone.timedelta(hours=7))[:-13]
            options = '''
                <div class="btn-group mr-2" role="group" aria-label="First group">
                    <button type="button" class="btn cur-p btn-success" data-toggle="tooltip" title="Chỉnh sửa"><i class="fas fa-users-cog"></i></button> 
                    <button type="button" class="btn cur-p btn-warning" data-toggle="tooltip" title="Khóa"><i class="fas fa-user-lock"></i></i></button> 
                    <button type="button" class="btn cur-p btn-danger" data-toggle="tooltip" title="Xóa"><i class="fas fa-trash-alt"></i></button> 
                </div>
            '''
            data.append([teacher.fullname, teacher.username, gioi_tinh, last_login, options])
        big_data = {"data": data}
        json_data = json.loads(json.dumps(big_data))
        return JsonResponse(json_data)


def mon_data(request):
    user = request.user
    if user.is_authenticated:
        ls_mon = []
        for mon in Mon.objects.all():
            ls_mon.append({"ten": mon.ten, "lop": mon.lop})
        return JsonResponse(ls_mon, safe=False)


def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def user_profile(request):
    user = request.user
    return render(request, 'adminsc/profile.html', {'username': mark_safe(json.dumps(user.username))})