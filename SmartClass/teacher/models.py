from django.db import models
from django.contrib.auth.models import (
    BaseUserManager, AbstractBaseUser
)
from django.utils import timezone


class GiaoVienManager(BaseUserManager):
    def create_user(self, email, username, fullname, password):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """
        if not email:
            raise ValueError('Users must have an email address')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            fullname=fullname,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, fullname, password):
        """
        Creates and saves a superuser with the given email, date of
        birth and password.
        """
        user = self.create_user(
            email,
            password=password,
            username=username,
            fullname=fullname,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user




class GiaoVien(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
    )
    fullname = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)

    objects = GiaoVienManager()

    class Meta:
        managed = True
        db_table = 'giao_vien'

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin


class HocSinhManager(BaseUserManager):
    def create_user(self, username, fullname, password):
        """
        Creates and saves a User with the given email, date of
        birth and password.
        """

        user = self.model(
            username=username,
            fullname=fullname,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user


class HocSinh(AbstractBaseUser):
    email = models.EmailField(
        verbose_name='email address',
        max_length=255,
        unique=True,
        null=True,
    )
    fullname = models.CharField(max_length=100)
    username = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    objects = HocSinhManager()

    class Meta:
        managed = True
        db_table = 'hoc_sinh'

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        # Simplest possible answer: Yes, always
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        # Simplest possible answer: Yes, always
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        # Simplest possible answer: All admins are staff
        return self.is_admin


class Truong(models.Model):
    ten = models.CharField(max_length=255)
    mo_ta = models.TextField()

    class Meta:
        managed = True
        db_table = 'truong'


class Lop(models.Model):
    ten = models.CharField(max_length=255)
    truong_id = models.ForeignKey('Truong', models.CASCADE, db_column='truong_id')

    class Meta:
        managed = True
        db_table = 'lop'


class ChiTietLop(models.Model):
    lop_id = models.ForeignKey('Lop', models.CASCADE, db_column='lop_id')
    giao_vien_id = models.ForeignKey('GiaoVien', models.CASCADE, null=True, db_column='giao_vien_id')
    hoc_sinh_id = models.ForeignKey('HocSinh', models.CASCADE, null=True, db_column="hoc_sinh_id")

    class Meta:
        managed = True
        db_table = 'chi_tiet_lop'


class Mon(models.Model):
    ten = models.CharField(max_length=255)
    lop = models.IntegerField()
    mo_ta = models.TextField()

    class Meta:
        managed = True
        db_table = 'mon'


class GiaoVienMon(models.Model):
    giao_vien_id = models.ForeignKey('GiaoVien', models.CASCADE, db_column='giao_vien_id')
    mon_id = models.ForeignKey('Mon', models.CASCADE, db_column='mon_id')

    class Meta:
        managed = True
        db_table = 'giao_vien_mon'


class De(models.Model):
    ten = models.CharField(max_length=255)
    giao_vien_id = models.ForeignKey('GiaoVien', models.CASCADE, db_column='giao_vien_id')
    mon = models.ForeignKey('Mon', models.CASCADE, db_column='mon_id')
    ngay_tao = models.DateField(default=timezone.now)
    loai_de = models.IntegerField()
    #

    class Meta:
        managed = True
        db_table = 'de'


class ChiTietDe(models.Model):
    de_id = models.ForeignKey('De', models.CASCADE, db_column='de_id')
    cau_hoi = models.ForeignKey('CauHoi', models.CASCADE, db_column='cau_hoi_id')

    class Meta:
        managed = True
        db_table = 'chi_tiet_de'


class CauHoi(models.Model):
    giao_vien_id = models.ForeignKey('GiaoVien', models.CASCADE, db_column='giao_vien_id')
    mon_id = models.ForeignKey('Mon', models.CASCADE, db_column='mon_id')
    ngay_tao = models.DateField(default=timezone.now)
    noi_dung = models.TextField()

    class Meta:
        managed = True
        db_table = 'cau_hoi'


class DapAn(models.Model):
    cau_hoi_id = models.ForeignKey('CauHoi', models.CASCADE, db_column='cau_hoi_id')
    mon_id = models.ForeignKey('Mon', models.CASCADE, db_column='mon_id')
    noi_dung = models.TextField()
    dap_an_dung = models.BooleanField()

    class Meta:
        managed = True
        db_table = 'dap_an'


class BaiLamHocSinh(models.Model):
    de_id = models.ForeignKey('De', models.CASCADE, db_column='de_id')
    cau_hoi_id = models.ForeignKey('CauHoi', models.CASCADE, db_column='cau_hoi_id')
    hoc_sinh_id = models.ForeignKey('HocSinh', models.CASCADE, db_column='hoc_sinh_id')
    dap_an = models.CharField(max_length=255)

    class Meta:
        managed = True
        db_table = 'bai_lam_hoc_sinh'


class DiemSo(models.Model):
    de_id = models.ForeignKey('De', models.CASCADE, db_column='de_id')
    hoc_sinh_id = models.ForeignKey('HocSinh', models.CASCADE, db_column='hoc_sinh_id')
    dap_an = models.CharField(max_length=255)
    ngay_lam = models.DateField(default=timezone.now)

    class Meta:
        managed = True
        db_table = 'diem_so'


class Nhom(models.Model):
    ten_nhom = models.CharField(max_length=255)
    giao_vien_id = models.ForeignKey('GiaoVien', models.CASCADE, db_column='giao_vien_id')

    class Meta:
        managed = True
        db_table = 'nhom'


class ChiTietNhom(models.Model):
    nhom_id = models.ForeignKey('Nhom', models.CASCADE, db_column='nhom_id')
    hoc_sinh_id = models.ForeignKey('HocSinh', models.CASCADE, db_column='hoc_sinh_id')

    class Meta:
        managed = True
        db_table = 'chi_tiet_nhom'