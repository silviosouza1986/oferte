from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, LogoutView, UserViewSet, ProfileView, LoginPageView

router = DefaultRouter()
router.register('usuarios', UserViewSet, basename='usuarios')

urlpatterns = [
    path('login/', LoginPageView.as_view(), name='login'),
    path('api/auth/login/', LoginView.as_view(), name='api-login'),
    path('api/auth/logout/', LogoutView.as_view(), name='api-logout'),
    path('api/auth/profile/', ProfileView.as_view(), name='api-profile'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='api-refresh'),
    path('api/', include(router.urls)),
]
