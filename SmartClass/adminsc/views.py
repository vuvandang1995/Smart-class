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
            list_mon = request.POST['list_mon']
            list_mon = json.loads(list_mon)
            if request.POST['kieu'] == 'new':
                try:
                    gv = MyUser.objects.create_teacher(email=request.POST['email'],
                                                       fullname=request.POST['fullname'],
                                                       username=request.POST['username'],
                                                       password=request.POST['password'],
                                                       gioi_tinh=request.POST['gioi_tinh'])
                    for mon in list_mon:
                        ten, lop = mon.split(" - ")
                        m = Mon.objects.get(ten=ten, lop=lop)
                        GiaoVienMon.objects.create(mon_id=m, myuser_id=gv)
                except:
                    pass
            else:
                try:
                    gv = MyUser.objects.get(username=request.POST['username'])
                    gv.fullname = request.POST['fullname']
                    gv.gioi_tinh = request.POST['gioi_tinh']
                    gv.email = request.POST['email']
                    gv.save()
                    GiaoVienMon.objects.filter(myuser_id=gv).delete()
                    for mon in list_mon:
                        ten, lop = mon.split(" - ")
                        m = Mon.objects.get(ten=ten, lop=lop)
                        GiaoVienMon.objects.create(mon_id=m, myuser_id=gv)
                except:
                    pass
        return render(request, 'adminsc/manage_teacher.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_teacher_data(request):
    user = request.user
    if user.is_authenticated:
        ls_teacher = MyUser.objects.filter(position=1)
        data = []
        for teacher in ls_teacher:
            fullname = '<p id="full_{}">'.format(teacher.id) + teacher.fullname + '</p>'
            username = '<p id="user_{}">'.format(teacher.id) + teacher.username + '</p>'
            if teacher.gioi_tinh == 0:
                gioi_tinh = '<p id="gioi_{}">'.format(teacher.id) + 'Nữ</p>'
            else:
                gioi_tinh = '<p id="gioi_{}">'.format(teacher.id) + 'Nam</p>'
            if teacher.last_login is not None:
                last_login = str(teacher.last_login + timezone.timedelta(hours=7))[:-13]
            mon = GiaoVienMon.objects.filter(myuser_id=teacher)
            ls_mon = ''
            for m in mon:
                ls_mon += '<p hidden class="list_mon{0}">{1} - {2}</p>'.format(teacher.id, m.mon_id.ten, m.mon_id.lop)
            options = '''
                <div class="btn-group mr-2" role="group" aria-label="First group">
                    <button type="button" class="btn cur-p btn-success" data-toggle="modal" data-target="#new_teacher" data-title="edit" id="edit_{0}">
                        <i class="fas fa-users-cog" data-toggle="tooltip" title="Chỉnh sửa"></i>
                    </button> 
                    <button type="button" class="btn cur-p btn-warning" data-title="block" id="block_{0}">
                        <i class="fas fa-user-lock" data-toggle="tooltip" title="Khóa"></i></i>
                    </button> 
                    <button type="button" class="btn cur-p btn-danger" data-title="del" id="del_{0}">
                        <i class="fas fa-trash-alt" data-toggle="tooltip" title="Xóa"></i>
                    </button> 
                </div>
                <p hidden id="email_{0}">{1}</p>
                {2}
            '''.format(teacher.id, teacher.email, ls_mon,)
            data.append([fullname, username, gioi_tinh, last_login, options])
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