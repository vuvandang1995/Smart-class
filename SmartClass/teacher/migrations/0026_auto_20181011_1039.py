# Generated by Django 2.1 on 2018-10-11 03:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('teacher', '0025_auto_20181011_1034'),
    ]

    operations = [
        migrations.AlterField(
            model_name='diemso',
            name='bai_lam',
            field=models.TextField(default=0),
        ),
        migrations.AlterField(
            model_name='diemso',
            name='diem_cham_tay',
            field=models.FloatField(default=0),
        ),
    ]