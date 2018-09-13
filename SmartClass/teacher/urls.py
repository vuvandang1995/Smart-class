from django.conf.urls import include, url
from django.urls import path
from . import views

app_name = 'teacher'
urlpatterns = [
    path('', views.user_login),
    path('teacher', views.home, name='home'),
    path('manage_class/<str:lop>', views.manage_class, name='manage_class'),
    path('manage_point/<str:lop>', views.manage_point, name='manage_point'),
    path('manage_point_data_<str:lop>', views.manage_point_data, name='manage_point_data'),
    path('manage_de', views.manage_de, name='manage_de'),
    path('manage_question', views.manage_question, name='manage_question'),
    path('profile', views.user_profile, name='profile'),
    path('logout', views.user_logout, name='logout'),
    path(r'^resetpassword/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.resetpwd, name='resetpassword'),
]
