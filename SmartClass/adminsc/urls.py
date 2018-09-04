from django.conf.urls import include, url
from django.urls import path
from . import views

app_name = 'adminsc'
urlpatterns = [
    path('/home', views.home, name='home'),
    url(r'profile/$', views.user_profile, name='profile'),
    url(r'logout/$', views.user_logout, name='logout'),
]
