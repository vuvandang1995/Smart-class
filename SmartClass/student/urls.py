from django.urls import path, include
from . import views

app_name = 'student'
urlpatterns = [
    path('', views.home, name='home'),
    path('profile', views.user_profile, name='profile'),
    path('score', views.score, name='score'),
    path('score_data', views.score_data, name='score_data'),
    path('mon_<int:id>', views.mon, name='mon'),
    path('logout', views.user_logout, name='logout'),
]