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
        content = {'mon': lop_mon(user)}
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
        content = {'mon': lop_mon(user)}
        return render(request, 'student/profile.html', content)
    else:
        return redirect("/")

    
def score(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        content = {'mon': lop_mon(user)}
        return render(request, 'student/score.html', content)
    else:
        return redirect("/")


def mon(request, id):
    user = request.user
    if user.is_authenticated and user.position == 0:
        lopOb = ChiTietLop.objects.get(myuser_id=user)
        monOb = Mon.objects.get(id=id)
        ls_chi_tiet = ChiTietLop.objects.filter(lop_id=lopOb.lop_id).values('myuser_id')
        ls_student = MyUser.objects.filter(id__in=ls_chi_tiet, position=0)
        ls_teacher = MyUser.objects.filter(id__in=ls_chi_tiet, position=1)
        teacher_ht = GiaoVienMon.objects.get(myuser_id__in=ls_teacher, mon_id=monOb)
        content = {'mon': lop_mon(user), 'mon_ht': monOb, 'ls_student': ls_student, 'teacher_ht': teacher_ht}
        return render(request, 'student/subjects.html', content)
    else:
        return redirect("/")


def score_data(request):
    user = request.user

    if user.is_authenticated and user.position == 0:
        data = []
        for mon in Mon.objects.all():
            list_score = DiemSo.objects.filter(myuser_id=user, mon_id=mon)
            if len(list_score) == 0:
                continue
            mon_data = '<p id="mon_{}">{} - {}</p>'.format(mon.id, mon.ten, mon.lop)
            diem_ly_thuyet = '<div class="row">'
            diem_thuc_hanh = '<div class="row">'
            diem_thi = '<div class="row">'
            for diem in list_score:
                if diem.loai_diem == 'lý thuyết':
                    diem_ly_thuyet += '''
                        <a class="btn" id="lt_{0}" data-toggle="modal" data-target="#point" data-mon-id="{1}" data-ngay-lam="{2}" data-bai-lam="{3}">{4}</a>,
                        '''.format(diem.id, mon.id, str(diem.ngay_lam), "1+1=2", diem.diem)
                elif diem.loai_diem == 'thực hành':
                    diem_thuc_hanh += '''
                        <a class="btn" id="th_{0}" data-toggle="modal" data-target="#point" data-mon-id="{1}" data-ngay-lam="{2}" data-bai-lam="{3}">{4}</a>,
                        '''.format(diem.id, mon.id, str(diem.ngay_lam), "1+1=2", diem.diem)
                elif diem.loai_diem == 'thi':
                    diem_thi += '''
                        <a class="btn" id="thi_{0}" data-toggle="modal" data-target="#point" data-mon-id="{1}" data-ngay-lam="{2}" data-bai-lam="{3}">{4}</a>,
                        '''.format(diem.id, mon.id, str(diem.ngay_lam), "1+1=2", diem.diem)
            diem_ly_thuyet += '</div>'
            diem_thuc_hanh += '</div>'
            diem_thi += '</div>'
            data.append([mon_data, diem_ly_thuyet, diem_thuc_hanh, diem_thi])
        big_data = {"data": data}
        json_data = json.loads(json.dumps(big_data))
        return JsonResponse(json_data)
        

def user_mon(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        content = {'mon': lop_mon(user), 'lop': ChiTietLop.objects.get(myuser_id=user)}

        return render(request, 'student/mon.html', content)
    else:
        return redirect("/")


def lop_mon(user):
    lop = ChiTietLop.objects.get(myuser_id=user)
    try:
        ten_lop = lop.lop_id.ten[:2]
    except:
        ten_lop = lop.lop_id.ten[0]
    all_mon = Mon.objects.filter(lop=ten_lop)
    giao_vien = ChiTietLop.objects.filter(lop_id=lop.lop_id,
                                          myuser_id__in=MyUser.objects.filter(position=1)).values("myuser_id")
    return GiaoVienMon.objects.filter(myuser_id__in=giao_vien, mon_id__in=all_mon)
