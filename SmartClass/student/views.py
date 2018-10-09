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
import re


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
        content = {'mon': lop_mon(user), 'username': mark_safe(json.dumps(user.username))}
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
        content = {'mon': lop_mon(user), 'username': mark_safe(json.dumps(user.username))}
        return render(request, 'student/profile.html', content)
    else:
        return redirect("/")

    
def score(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        lopOb = ChiTietLop.objects.get(myuser_id=user)
        content = {'lop': mark_safe(json.dumps(lopOb.lop_id.ten)),
                   'mon': lop_mon(user),
                   'username': mark_safe(json.dumps(user.username))}
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
        content = {'lop': mark_safe(json.dumps(lopOb.lop_id.ten)), 'mon': lop_mon(user), 'mon_ht': monOb,
                   'ls_student': ls_student, 'teacher_ht': teacher_ht, 'username': mark_safe(json.dumps(user.username))}
        return render(request, 'student/subjects.html', content)
    else:
        return redirect("/")


def group_data(request, teacher):
    user = request.user
    if user.is_authenticated and user.position == 0:
        html = ''
        try:
            lopOb = ChiTietLop.objects.get(myuser_id=user)
            ls_nhom = ChiTietNhom.objects.filter(myuser_id=user).values('nhom_id')
            nhom = Nhom.objects.filter(myuser_id=MyUser.objects.get(username=teacher), id__in=ls_nhom)
            html += '''
                <div class="mail_list" id="group_class">
                <p hidden>'''+lopOb.lop_id.ten+teacher+nhom[0].ten_nhom+'''</p>
                <p hidden>'''+nhom[0].ten_nhom+'''</p>
                <div class="right">
                    <h3>'''+nhom[0].ten_nhom+'''</h3>
            '''
            for std in ChiTietNhom.objects.filter(nhom_id=nhom[0]):
                html += '''<p><i class="fa fa-user"></i> '''+std.myuser_id.fullname+'''</p>'''
            html += '''</div></div>'''
        except:
            pass
        return HttpResponse(html)


def score_data(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        data = []
        for mon in Mon.objects.all():
            list_score = DiemSo.objects.filter(myuser_id=user, mon_id=mon)
            if len(list_score) == 0:
                continue
            mon_data = ' <h5>{} - {}</h5>'.format(mon.ten, mon.lop)
            kiem_tra_15p = '<h4>'
            kiem_tra_1_tiet = '<h4>'
            diem_thi = '<h4>'
            for diem in list_score:
                if diem.diem < 5.0:
                    loai = "danger"
                elif diem.diem >= 5.0 and diem.diem < 6.5:
                    loai = "warning"
                elif diem.diem >= 6.5 and diem.diem < 8.0:
                    loai = "info"
                else:
                    loai = "success"
                temp = '''
                    <span class="label label-{2}" data-id="{0}" data-toggle="modal" data-target="#point" >{1}</span>
                    '''.format(diem.id, diem.diem, loai)
                if diem.loai_diem == "kiểm tra 15'":
                    kiem_tra_15p += temp
                elif diem.loai_diem == 'kiểm tra 1 tiết':
                    kiem_tra_1_tiet += temp
                elif diem.loai_diem == 'thi':
                    diem_thi += temp
            kiem_tra_15p += '</h4>'
            kiem_tra_1_tiet += '</h4>'
            diem_thi += '</h4>'
            data.append([mon_data, kiem_tra_15p, kiem_tra_1_tiet, diem_thi])
        big_data = {"data": data}
        json_data = json.loads(json.dumps(big_data))
        return JsonResponse(json_data)


def score_data_detail(request, id):
    user = request.user
    if user.is_authenticated and user.position == 0:
        diem = DiemSo.objects.get(id=id)
        content = '''
        <div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback">
          <input type="text" class="form-control has-feedback-left" value="{0}" disabled>
          <span class="fa fa-book form-control-feedback left" aria-hidden="true"></span>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback">
          <input type="number" class="form-control has-feedback-left" value="{1}" disabled>
          <span class="fa fa-edit form-control-feedback left" aria-hidden="true"></span>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback">
          <input type="date" class="form-control has-feedback-left" value="{2}" disabled>
          <span class="fa fa-calendar form-control-feedback left" aria-hidden="true"></span>
        </div>
        <div class="col-md-6 col-sm-6 col-xs-12 form-group has-feedback">
          <input type="text" class="form-control has-feedback-left" value="{3}" disabled>
          <span class="fa fa-book form-control-feedback left" aria-hidden="true"></span>
        </div>
        <div class="col-md-12 col-sm-12 col-xs-12">
            {4}
        </div>
        <div class="clearfix"></div>
        '''.format('{} - {}'.format(diem.mon_id.ten, diem.mon_id.lop), diem.diem, str(diem.ngay_lam), diem.loai_diem, diem.bai_lam)
        return HttpResponse(content)


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


def exam(request):
    user = request.user
    if user.is_authenticated and user.position == 0:
        if request.method == "POST":
            de = De.objects.get(id=request.POST['de_id'])
            ds_dap_an = json.loads(request.POST['ds_dap_an'])
            diem = 0
            bai_lam = request.POST['bai_lam']
            for i, ctd in enumerate(ChiTietDe.objects.filter(de_id=de)):
                if ctd.cau_hoi_id is not None:
                    if "Trắc nhiệm" in ctd.cau_hoi_id.dang_cau_hoi:
                        da_dung = []
                        da_chon = []
                        for da in DapAn.objects.filter(cau_hoi_id=ctd.cau_hoi_id):
                            da_dung.append(da.dap_an_dung)
                            da_chon.append(ds_dap_an["0_{}_{}".format(ctd.cau_hoi_id.id, da.id)])
                        if da_chon == da_dung:
                            diem += ctd.diem
                    elif "Điền từ" in ctd.cau_hoi_id.dang_cau_hoi:
                        ds_da = DapAn.objects.filter(cau_hoi_id=ctd.cau_hoi_id)
                        for da in ds_da:
                            if da.noi_dung.lower() == '<p>{}</p>'.format(ds_dap_an["0_{}_{}".format(ctd.cau_hoi_id.id, da.id)].lower()):
                                diem += ctd.diem / len(ds_da)
                else:
                    if "Trắc nhiệm" in ctd.cau_hoi_da_id.dang_cau_hoi:
                        for ch in ChiTietCauHoiDa.objects.filter(cau_hoi_da_id=ctd.cau_hoi_da_id):
                            da_dung = []
                            da_chon = []
                            for da in DapAn.objects.filter(cau_hoi_id=ch.cau_hoi_id):
                                da_dung.append(da.dap_an_dung)
                                da_chon.append(ds_dap_an["{}_{}_{}".format(ctd.cau_hoi_da_id.id, ch.cau_hoi_id.id, da.id)])
                            if da_chon == da_dung:
                                diem += ctd.diem / ctd.cau_hoi_da_id.so_cau_hoi
            DiemSo.objects.create(de_id=de, myuser_id=user, mon_id=de.mon_id, loai_diem=de.loai_de,
                                  bai_lam=bai_lam, diem=round(diem, 2))
        content = {'mon': lop_mon(user),
                   'lop': ChiTietLop.objects.get(myuser_id=user)}
        return render(request, 'student/exam2.html', content)
    else:
        return redirect("/")


def exam_data(request, id):
    user = request.user
    if user.is_authenticated and user.position == 0:
        left_content = ''
        right_content = ''
        for i, ques in enumerate(ChiTietDe.objects.filter(de_id=De.objects.get(id=id))):
            dap_an = ''
            left_content += '''
            <div class="mail_list">
                <a href="#cau_{0}" id="stt_{0}">
                  Câu {0} <span class="label label-danger"><i class="fa fa-close"></i></span>
                </a>
            </div>
            '''.format(i + 1)
            media = ''
            if ques.cau_hoi_id is not None:
                if "Hình ảnh" in ques.cau_hoi_id.dang_cau_hoi:
                    media = '<img style="max-height:600px;max-width:600px; display: block; margin-left: auto;margin-right: auto;" src="/media/{}" alt="không tồn tại" /><br>'.format(
                        ques.cau_hoi_id.dinh_kem)
                elif "Âm thanh" in ques.cau_hoi_id.dang_cau_hoi:
                    media = '<br><audio controls width="100%" src="/media/{}"></audio>'.format(ques.cau_hoi_id.dinh_kem)
                elif "Video" in ques.cau_hoi_id.dang_cau_hoi:
                    media = '<video controls width="100%" src="/media/{}"></video>'.format(ques.cau_hoi_id.dinh_kem)
                if "Trắc nhiệm" in ques.cau_hoi_id.dang_cau_hoi:
                    for k, da in enumerate(DapAn.objects.filter(cau_hoi_id=ques.cau_hoi_id)):
                        s = chr(ord(str(k)) + 17)
                        dap_an += '''
                        <div class="row div_tn">
                            <input type="checkbox" data-id="{0}" data-ch_id="0_{1}" data-da_id="{4}" data-kind="tn" style="transform:scale(1.3);" name="dap_an_0_{1}" class="dap_an">
                            <p>{2}:</p> 
                            {3}
                        </div>'''.format(i+1, ques.cau_hoi_id.id, s, da.noi_dung, da.id)
                    right_content += '''
                    <div id="cau_{0}">
                        <label>Câu hỏi {0} ({4} điểm):</label>
                        <div class="row">{3}</div>
                        <div class="row div_ch">{1}</div>
                        {2}
                    </div>
                    '''.format(i + 1, ques.cau_hoi_id.noi_dung, dap_an, media, ques.diem)
                elif "Điền từ" in ques.cau_hoi_id.dang_cau_hoi:
                    nd_cau_hoi = ques.cau_hoi_id.noi_dung
                    for k, da in enumerate(DapAn.objects.filter(cau_hoi_id=ques.cau_hoi_id)):
                        dap_an += '''
                        <div class="row div_dt">
                            <p>({3}):</p> 
                            <input type="text" data-id="{0}" data-ch_id="0_{1}" data-da_id="{2}" data-kind="dt" name="dap_an_0_{1}" class="dap_an"> 
                        </div>'''.format(i + 1, ques.cau_hoi_id.id, da.id, k+1)
                    right_content += '''
                        <div id="cau_{0}">
                            <label>Câu hỏi {0} ({4} điểm):</label>
                            <div class="row">{2}</div>
                            <div class="row div_ch">{1}</div>
                            {3}
                        </div>
                    '''.format(i + 1, nd_cau_hoi, media, dap_an, ques.diem)
                elif "Tự luận" in ques.cau_hoi_id.dang_cau_hoi:
                    right_content += '''
                        <div id="cau_{0}">
                            <label>Câu hỏi {0} ({3} điểm):</label>
                            <div class="row">{2}</div>
                            <div class="row div_ch">{1}</div>
                            <div class="row div_tl">
                                <textarea class="form-control dap_an" cols="100" rows="10" data-id="{0}" data-ch_id="0_{4}" data-kind="tl" name="dap_an_0_{4}" ></textarea>
                            </div>
                        </div>
                    <div>
                    '''.format(i + 1, ques.cau_hoi_id.noi_dung, media, ques.diem, ques.cau_hoi_id.id)
            else:
                if "Hình ảnh" in ques.cau_hoi_da_id.dang_cau_hoi:
                    media = '<img style="max-height:600px;max-width:600px; display: block; margin-left: auto;margin-right: auto;" src="/media/{}" alt="không tồn tại" /><br>'.format(
                        ques.cau_hoi_da_id.dinh_kem)
                elif "Âm thanh" in ques.cau_hoi_da_id.dang_cau_hoi:
                    media = '<br><audio controls width="100%" src="/media/{}"></audio>'.format(ques.cau_hoi_da_id.dinh_kem)
                elif "Video" in ques.cau_hoi_da_id.dang_cau_hoi:
                    media = '<video controls width="100%" src="/media/{}"></video>'.format(ques.cau_hoi_da_id.dinh_kem)
                if "Trắc nhiệm" in ques.cau_hoi_da_id.dang_cau_hoi:
                    for index, ch in enumerate(ChiTietCauHoiDa.objects.filter(cau_hoi_da_id=ques.cau_hoi_da_id)):
                        dap_an += '''
                        <div class="row div_sub">{0}.{1} ({3} điểm): {2}</div>
                        '''.format(i+1, index+1, ch.cau_hoi_id.noi_dung,
                                   round(ques.diem / ques.cau_hoi_da_id.so_cau_hoi, 2))
                        for k, da in enumerate(DapAn.objects.filter(cau_hoi_id=ch.cau_hoi_id)):
                            s = chr(ord(str(k)) + 17)
                            dap_an += '''
                            <div class="row div_tn">
                                <input type="checkbox" data-id="{0}" data-ch_id="{1}_{5}" data-da_id="{4}" data-kind="tn" style="transform:scale(1.3);" name="dap_an_{1}_{5}" class="dap_an">
                                <p>{2}:</p> 
                                {3}
                            </div>'''.format(i+1, ques.cau_hoi_da_id.id, s, da.noi_dung, da.id, ch.cau_hoi_id.id)
                    right_content += '''
                    <div id="cau_{0}">
                        <label>Câu hỏi {0} ({4} điểm):</label>
                        <div class="row">{3}</div>
                        <div class="row div_ch">{1}</div>
                        {2}
                    </div>
                    '''.format(i + 1, ques.cau_hoi_da_id.noi_dung, dap_an, media, ques.diem)
                elif "Tự luận" in ques.cau_hoi_da_id.dang_cau_hoi:
                    for index, ch in enumerate(ChiTietCauHoiDa.objects.filter(cau_hoi_da_id=ques.cau_hoi_da_id)):
                        dap_an += '''
                        <div class="row div_sub">{0}.{1} ({5} điểm): {2}</div>
                        <div class="row div_tl">
                            <textarea class="form-control dap_an" cols="100" rows="10" data-id="{0}" data-ch_id="{3}_{4}" data-kind="tl" name="dap_an_{3}_{4}" ></textarea>
                        </div>
                        '''.format(i+1, index+1, ch.cau_hoi_id.noi_dung, ques.cau_hoi_da_id.id, ch.cau_hoi_id.id,
                                   round(ques.diem / ques.cau_hoi_da_id.so_cau_hoi, 2))
                    right_content += '''
                    <div id="cau_{0}">
                        <label>Câu hỏi {0} ({4} điểm):</label>
                        <div class="row">{3}</div>
                        <div class="row div_ch">{1}</div>
                        {2}
                    </div>
                    '''.format(i + 1, ques.cau_hoi_da_id.noi_dung, dap_an, media, ques.diem)
        lop = ChiTietLop.objects.filter(myuser_id=user)[0]

        content = '''
        <div class="col-sm-1">{0}</div>
        <div class="col-sm-8 baithi" id="bai_lam">
            <input type="hidden" value="{2}" name="de_id">
            <div class="inbox-body">
                <div class="mywrap">{1}</div>
            </div>
        </div></div>
        <div class="col-sm-3">
            <h3><i class="fa fa-clock-o"></i> 00:00</h3>
            <h5>Thời gian làm bài</h5>
            <table class="mytable" >
                <tr>
                    <td>Họ và tên</td>
                    <td><b>{3}</b></td>
                </tr>
                <tr>
                    <td>Lớp</td>
                    <td>{4}</td>
                </tr>
                <tr>
                    <td>Khoa</td>
                    <td>{5}</td>
                </tr>
                <tr>
                    <td>Khóa</td>
                    <td>{6} - {7}</td>
                </tr>
            </table>
            <hr>
            <div class="row">
                <div class="col-sm-4"></div>
                <div class="col-sm-4">
                    <button class="btn btn-primary btn-lg" id="submit" onclick="nopBai();">Nộp bài <i class="fa fa-send"></i> </button>
                </div>
                <div class="col-sm-4"></div>
            </div>
            <hr>
            <font color="red">*Chú ý: Điểm lẻ của môn thi tự luận được làm tròn đến 2 chữ số thập phân thay vì lấy đến 
            0,25 điểm như trước; thay đổi hình thức xử lý thí sinh vi phạm quy chế thi,… là những thay đổi nổi bật 
            nhất trong Quy chế thi THPT quốc gia và xét công nhận tốt nghiệp THPT năm 2018 mà Bộ GD&ĐT vừa công bố 
            chính thức.
            </font>
        </div>
        '''.format(left_content, right_content, id, user.fullname, lop.lop_id.ten, lop.lop_id.khoa_id.ten_khoa,
                   lop.lop_id.nien_khoa_id.ten_nien_khoa, lop.lop_id.nien_khoa_id.nam_hoc)
        return HttpResponse(content)