from rest_framework import generics, status, permissions
from rest_framework.response import Response

from .models import ConfiguracaoIgreja, UserProfile
from .serializers import ConfiguracaoIgrejaSerializer, UserProfileSerializer
from accounts.serializers import ChangePasswordSerializer
from accounts.views import IsAdminUser


class ConfiguracaoIgrejaView(generics.RetrieveUpdateAPIView):
    serializer_class = ConfiguracaoIgrejaSerializer
    queryset = ConfiguracaoIgreja.objects.all()

    def get_object(self):
        return ConfiguracaoIgreja.get_instance()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdminUser()]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class ChangePasswordView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'error': 'Senha atual incorreta'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({'message': 'Senha alterada com sucesso'})
