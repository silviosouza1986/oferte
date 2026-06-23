from django.db import models
from rest_framework import viewsets, status, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import authenticate
from django.views.generic import TemplateView

from .models import User
from .serializers import UserSerializer, LoginSerializer, ChangePasswordSerializer


class LoginPageView(TemplateView):
    template_name = 'registration/login.html'


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        if not user:
            return Response({'error': 'Credenciais inválidas'}, status=status.HTTP_401_UNAUTHORIZED)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        })


class LogoutView(generics.GenericAPIView):
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass
        return Response({'message': 'Logout realizado'})


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.cargo == 'admin'


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.cargo == 'admin'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.cargo == 'admin'


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.cargo != 'admin':
            qs = qs.filter(id=self.request.user.id)
        search = self.request.query_params.get('search', '')
        cargo = self.request.query_params.get('cargo', '')
        ativos = self.request.query_params.get('ativos', '')
        dizimistas = self.request.query_params.get('is_dizimista', '')

        if search:
            qs = qs.filter(
                models.Q(nome__icontains=search) |
                models.Q(cpf__icontains=search) |
                models.Q(email__icontains=search)
            )
        if cargo:
            qs = qs.filter(cargo=cargo)
        if ativos.lower() == 'true':
            qs = qs.filter(is_active=True)
        if dizimistas.lower() == 'true':
            qs = qs.filter(is_dizimista=True)
        return qs


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
