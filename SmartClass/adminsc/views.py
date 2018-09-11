from django.shortcuts import render, redirect, get_object_or_404
from django.template import RequestContext
from django.contrib.auth import login
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from django.contrib.auth.hashers import check_password
from django.contrib import messages
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


def manage_teacher_data(request, lop):
    user = request.user
    if user.is_authenticated and user.position == 2:
        if lop == 'all':
            ls_teacher = MyUser.objects.filter(position=1)
        else:
            ls_chi_tiet = ChiTietLop.objects.filter(lop_id=Lop.objects.get(ten=lop)).values('myuser_id')
            ls_teacher = MyUser.objects.filter(id__in=ls_chi_tiet, position=1)
        data = []
        for teacher in ls_teacher:
            fullname = '<p id="full_{0}">{1}</p>'.format(teacher.id, teacher.fullname)
            username = '<p id="user_{0}">{1}</p>'.format(teacher.id, teacher.username)
            if teacher.gioi_tinh == 0:
                gioi_tinh = '<p id="gioi_{}">Nữ</p>'.format(teacher.id)
            else:
                gioi_tinh = '<p id="gioi_{}">Nam</p>'.format(teacher.id)
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


def manage_student(request):
    user = request.user

    content = {'username': mark_safe(json.dumps(user.username)), 'ds_lop': Lop.objects.all()}

    if user.is_authenticated and user.position == 2:
        if request.method == 'POST':
            if 'delete' in request.POST:
                MyUser.objects.get(id=request.POST['delete']).delete()
            elif 'block' in request.POST:
                hs = MyUser.objects.get(id=request.POST['block'])
                if hs.is_active:
                    hs.is_active = False
                else:
                    hs.is_active = True
                hs.save()
            else:

                if request.POST['kieu'] == 'new':
                    try:
                        hs = MyUser.objects.create_student(email=request.POST['email'],
                                                           fullname=request.POST['fullname'],
                                                           username=request.POST['username'],
                                                           password=request.POST['password'],
                                                           gioi_tinh=request.POST['gioi_tinh'])
                        new_lop = Lop.objects.get(ten=request.POST['list_lop'])
                        ChiTietLop.objects.create(lop_id=new_lop, myuser_id=hs)
                    except:
                        pass
                else:
                    try:
                        hs = MyUser.objects.get(username=request.POST['username'])
                        hs.fullname = request.POST['fullname']
                        hs.gioi_tinh = request.POST['gioi_tinh']
                        hs.email = request.POST['email']
                        hs.save()

                        lop = ChiTietLop.objects.get(myuser_id=hs)
                        lop.lop_id = Lop.objects.get(ten=request.POST['list_lop'])
                        lop.save()

                    except:
                        pass
        return render(request, 'adminsc/manage_student.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_student_data(request, lop):
    user = request.user
    if user.is_authenticated and user.position == 2:
        if lop == 'all':
            ls_student = MyUser.objects.filter(position=0)
        else:
            ls_chi_tiet = ChiTietLop.objects.filter(lop_id=Lop.objects.get(ten=lop)).values('myuser_id')
            ls_student = MyUser.objects.filter(id__in=ls_chi_tiet, position=0)
        data = []
        for student in ls_student:
            fullname = '<p id="full_{0}">{1}</p>'.format(student.id, student.fullname)
            username = '<p id="user_{0}">{1}</p>'.format(student.id, student.username)
            if student.gioi_tinh == 0:
                gioi_tinh = '<p id="gioi_{}">Nữ</p>'.format(student.id)
            else:
                gioi_tinh = '<p id="gioi_{}">Nam</p>'.format(student.id)
            if student.is_active:
                icon = 'fa fa-lock'
                title = 'khóa'
                trang_thai = '<span class="label label-success">kích hoạt</span>'
            else:
                icon = 'fa fa-unlock'
                title = 'mở khóa'
                trang_thai = '<span class="label label-danger">khóa</span>'
            lop_ct = ''
            try:
                lop_ct = ChiTietLop.objects.get(myuser_id=student)
                lop_ct = lop_ct.lop_id.ten
            except ObjectDoesNotExist:
                pass
            ls_lop = '<p class="list_lop{0}">{1}</p>'.format(student.id, lop_ct)
            options = '''
                <div class="btn-group">
                    <button type="button" class="btn btn-info" data-toggle="modal" data-target="#new_student" data-title="edit" id="edit_{0}">
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
            '''.format(student.id, student.email, icon, title)
            data.append([fullname, gioi_tinh, ls_lop, username, trang_thai, options])
        big_data = {"data": data}
        json_data = json.loads(json.dumps(big_data))
        return JsonResponse(json_data)


def manage_class(request):
    user = request.user

    content = {'username': mark_safe(json.dumps(user.username))}

    if user.is_authenticated and user.position == 2:
        if request.method == 'POST':
            if 'delete' in request.POST:
                Lop.objects.get(id=request.POST['delete']).delete()
            else:
                if request.POST['kieu'] == 'new':
                    try:
                        Lop.objects.create(ten=request.POST['ten'], truong_id=Truong.objects.get(id=1))
                    except:
                        pass
                else:
                    print(request.POST)
                    hs = Lop.objects.get(id=request.POST['id'])
                    hs.ten = request.POST['ten']
                    hs.save()
        return render(request, 'adminsc/manage_class.html', content)
    else:
        return HttpResponseRedirect('/')


def manage_class_data(request):
    user = request.user
    if user.is_authenticated and user.position == 2:
        data = []
        for lop in Lop.objects.all():
            ten = '<p id="ten_{}">{}</p>'.format(lop.id, lop.ten)
            ls_chi_tiet = ChiTietLop.objects.filter(lop_id=lop).values('myuser_id')
            gv = '''
            {1}  <i class="fa fa-info-circle" data-title="{0}" data-toggle="modal" data-target="#detail_teacher"></i> 
            '''.format(lop.ten, MyUser.objects.filter(id__in=ls_chi_tiet, position=1).count())
            hs = '''
            {1}  <i class="fa fa-info-circle" data-title="{0}" data-toggle="modal" data-target="#detail_student"></i> 
            '''.format(lop.ten, MyUser.objects.filter(id__in=ls_chi_tiet, position=0).count())
            options = '''
                <div class="btn-group">
                    <button type="button" class="btn btn-info" data-toggle="modal" data-target="#new_class" data-title="edit" id="edit_{0}">
                        <i class="fa fa-cog" data-toggle="tooltip" title="Chỉnh sửa"></i>
                    </button> 
                    <button type="button" class="btn btn-danger" data-title="del" id="del_{0}">
                        <i class="fa fa-trash" data-toggle="tooltip" title="Xóa"></i>
                    </button> 
                </div>
            '''.format(lop.id)
            data.append([ten, gv, hs, options])
        big_data = {"data": data}
        json_data = json.loads(json.dumps(big_data))
        return JsonResponse(json_data)


def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def user_profile(request):
    user = request.user
    if user.is_authenticated and user.position == 2:
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
        content = {'username': mark_safe(json.dumps(user.username))}
        return render(request, 'adminsc/profile.html', content)
    else:
        return redirect("/")

