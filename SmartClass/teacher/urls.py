from django.conf.urls import include, url
from django.urls import path
from . import views

app_name = 'teacher'
urlpatterns = [
    path('', views.user_login),
    path('teacher', views.home, name='home'),
    path('/profile', views.user_profile, name='profile'),
    path('/logout', views.user_logout, name='logout'),
    path('quanlydiem', views.user_quanlydiem, name='quanlydiem'),
    path(r'^resetpassword/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.resetpwd, name='resetpassword'),
]
