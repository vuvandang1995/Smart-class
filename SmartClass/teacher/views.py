from django.shortcuts import render, redirect, get_object_or_404
from django.template import RequestContext
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth import logout, login
from django.contrib import auth
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
from .tokens import account_activation_token
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
    if user.is_authenticated and user.position == 1:
        return render(request, 'teacher/index.html',{'username': mark_safe(json.dumps(user.username)),})
    else:
        return HttpResponseRedirect('/')

def user_quanlydiem(request):
    return render(request, 'teacher/quanlydiem.html')

def manage_point_data(request, lop):
    user = request.user
    if user.is_authenticated and user.position == 1:
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
            
            DiemSo.objects.filter(myuser_id = student,).values('myuser_id')
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


def user_login(request):
    user = request.user
    if user.is_authenticated:
        if user.position == 0:
            return redirect("/student")
        elif user.position == 1:
            return redirect("/teacher")
        else:
            return redirect("/adminsc")
    else:
        if request.method == 'POST':
            # post form để User yêu cầu reset mật khẩu, gửi link về mail
            if 'uemail' in request.POST:
                form = UserResetForm(request.POST)
                if form.is_valid():
                    to_email = form.cleaned_data['uemail']
                    current_site = get_current_site(request)
                    user = get_email(to_email)
                    mail_subject = 'Reset password your account.'
                    message = render_to_string('teacher/resetpwd.html', {
                        'user': user,
                        'domain': current_site.domain,
                        'uid':urlsafe_base64_encode(force_bytes(user.id)).decode(),
                        'token':account_activation_token.make_token(user),
                    })
                    email = EmailMessage(
                                mail_subject, message, to=[to_email]
                    )
                    thread = EmailThread(email)
                    thread.start()
                    return render(request, 'teacher/login.html', {'mess': 'Please check email to reset your password!'})
                else:
                    error = ''
                    for field in form:
                        error += field.errors
                    return render(request, 'teacher/login.html', {'error': error})
            elif 'username' and 'password' in request.POST:
                username = request.POST['username']
                password = request.POST['password']
                user = authenticate(username=username, password=password)
                if user:
                    if user.is_active:
                        login(request, user)
                        if user.position == 0:
                            return HttpResponseRedirect('/student')
                        elif user.position == 1:
                            return HttpResponseRedirect('/teacher')
                        else:
                            return redirect('/adminsc/')
                    else:
                        return render(request, 'teacher/login.html', {'error': 'Your account is blocked!'})
                else:
                    return render(request, 'teacher/login.html', {'error': 'Invalid username or password '})
            elif 'firstname' and 'email' and 'password2' in request.POST:
                user_form = UserForm(request.POST)
                if user_form.is_valid():
                    user = user_form.save()
                    return redirect('/')
                else:
                    print(user_form.errors)
                    error = ''
                    for field in user_form:
                        error += field.errors
                    return render(request, 'teacher/login.html',{'error':error})
        return render(request, 'teacher/login.html')


def resetpwd(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = MyUser.objects.get(id=uid)
    except(TypeError, ValueError, OverflowError):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        if request.method == 'POST':
            form = ResetForm(request.POST)
            if form.is_valid():
                user.set_password(form.cleaned_data)
                user.save()
                return redirect('/')
            else:
                return redirect('/')
        return render(request, 'teacher/formresetpass.html', {})
    else:
        return HttpResponse('Link is invalid!')


def user_logout(request):
    logout(request)
    return HttpResponseRedirect('/')


def user_profile(request):
    user = request.user
    if user.is_authenticated and user.position == 1:
        return render(request, 'teacher/profile.html', {'username': mark_safe(json.dumps(user.username))})
    else:
        return HttpResponseRedirect('/')