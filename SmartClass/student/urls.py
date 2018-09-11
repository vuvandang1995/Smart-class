from django.urls import path, include
from . import views

app_name = 'student'
urlpatterns = [
    path('', views.home, name='home'),
    path('/profile', views.user_profile, name='profile'),
    path('/score', views.user_score, name='score'),
    path('/logout', views.user_logout, name='logout'),
]