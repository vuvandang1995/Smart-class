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
    if user.is_authenticated and user.position == 2:
        content = {'username': mark_safe(json.dumps(user.username)),}
        return render(request, 'adminsc/base.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_teacher(request):
    user = request.user

    content = {'username': mark_safe(json.dumps(user.username)),}

    if user.is_authenticated and user.position == 2:
        if request.method == 'POST':
            if 'delete' in request.POST:
                MyUser.objects.get(id=request.POST['delete']).delete()
            elif 'block' in request.POST:
                gv = MyUser.objects.get(id=request.POST['block'])
                print(request.POST)
                if gv.is_active:
                    gv.is_active = False
                else:
                    gv.is_active = True
                gv.save()
            else:
                list_mon = request.POST['list_mon']
                list_mon = json.loads(list_mon)
                list_lop = request.POST['list_lop']
                list_lop = json.loads(list_lop)
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
                        for ten in list_lop:
                            l = Lop.objects.get(ten=ten)
                            ChiTietLop.objects.create(lop_id=l, myuser_id=gv)
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
                        ChiTietLop.objects.filter(myuser_id=gv).delete()
                        for ten in list_lop:
                            l = Lop.objects.get(ten=ten)
                            ChiTietLop.objects.create(lop_id=l, myuser_id=gv)
                    except:
                        pass
        return render(request, 'adminsc/manage_teacher.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_teacher_data(request):
    user = request.user
    if user.is_authenticated and user.position == 2:
        ls_teacher = MyUser.objects.filter(position=1)
        data = []
        for teacher in ls_teacher:
            fullname = '<p id="full_{}">'.format(teacher.id) + teacher.fullname + '</p>'
            username = '<p id="user_{}">'.format(teacher.id) + teacher.username + '</p>'
            if teacher.gioi_tinh == 0:
                gioi_tinh = '<p id="gioi_{}">'.format(teacher.id) + 'Nữ</p>'
            else:
                gioi_tinh = '<p id="gioi_{}">'.format(teacher.id) + 'Nam</p>'
            if teacher.is_active:
                icon = 'fa fa-lock'
                title = 'khóa'
                trang_thai = '<span class="label label-success">kích hoạt</span>'
            else:
                icon = 'fa fa-unlock'
                title = 'mở khóa'
                trang_thai = '<span class="label label-danger">khóa</span>'
            mon = GiaoVienMon.objects.filter(myuser_id=teacher)
            ls_mon = ''
            for m in mon:
                ls_mon += '<p class="list_mon{0}">{1} - {2}</p>'.format(teacher.id, m.mon_id.ten, m.mon_id.lop)
            lop = ChiTietLop.objects.filter(myuser_id=teacher)
            ls_lop = ''
            for l in lop:
                ls_lop += '<p class="list_lop{0}">{1}</p>'.format(teacher.id, l.lop_id.ten)
            options = '''
                <div class="btn-group">
                    <button type="button" class="btn btn-info" data-toggle="modal" data-target="#new_teacher" data-title="edit" id="edit_{0}">
                        <i class="fa fa-cog" data-toggle="tooltip" title="Chỉnh sửa"></i>
                    </button> 
                    <button type="button" class="btn btn-warning" data-title="block" id="block_{0}">
                        <i class="{2}" data-toggle="tooltip" title="{3}"></i></i>
                    </button> 
                    <button type="button" class="btn btn-danger" data-title="del" id="del_{0}">
                        <i class="fa fa-trash" data-toggle="tooltip" title="Xóa"></i>
                    </button> 
                </div>
                <p hidden id="email_{0}">{1}</p>
            '''.format(teacher.id, teacher.email, icon, title)
            data.append([fullname, gioi_tinh, ls_mon, ls_lop, username, trang_thai, options])
        big_data = {"data": data}
        json_data = json.loads(json.dumps(big_data))
        return JsonResponse(json_data)


def mon_data(request):
    user = request.user
    if user.is_authenticated and user.position == 2:
        ls_mon = []
        for mon in Mon.objects.all():
            ls_mon.append({"ten": mon.ten, "lop": mon.lop})
        return JsonResponse(ls_mon, safe=False)


def lop_data(request):
    user = request.user
    if user.is_authenticated and user.position == 2:
        ls_lop = []
        for l in Lop.objects.all():
            ls_lop.append({"ten": l.ten})
        return JsonResponse(ls_lop, safe=False)


def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def user_profile(request):
    user = request.user
    if user.is_authenticated and user.position == 2:
        return render(request, 'adminsc/profile.html', {'username': mark_safe(json.dumps(user.username))})
    else:
        return redirect("/")

