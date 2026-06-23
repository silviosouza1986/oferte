import re
from rest_framework import serializers
from .models import ConfiguracaoIgreja, UserProfile


class ConfiguracaoIgrejaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracaoIgreja
        fields = ['nome', 'cnpj', 'endereco']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['theme_primary_color']

    def validate_theme_primary_color(self, value):
        if not re.match(r'^#[0-9a-fA-F]{6}$', value):
            raise serializers.ValidationError('Cor deve estar no formato #RRGGBB')
        return value
