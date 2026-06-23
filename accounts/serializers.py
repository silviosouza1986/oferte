import re
from rest_framework import serializers
from .models import User


def validate_cpf(value):
    cpf = re.sub(r'\D', '', value)
    if len(cpf) != 11:
        raise serializers.ValidationError('CPF deve ter 11 dígitos')
    if cpf == cpf[0] * 11:
        raise serializers.ValidationError('CPF inválido')
    for i in range(9, 11):
        soma = sum(int(cpf[j]) * (i + 1 - j) for j in range(i))
        dig = (soma * 10) % 11
        if dig == 10:
            dig = 0
        if dig != int(cpf[i]):
            raise serializers.ValidationError('CPF inválido')
    return cpf


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    theme_primary_color = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'nome', 'cpf', 'telefone', 'email', 'cargo', 'is_active', 'is_dizimista', 'password', 'theme_primary_color']
        read_only_fields = ['id']

    def get_theme_primary_color(self, obj):
        try:
            return obj.profile.theme_primary_color
        except Exception:
            return '#6750A4'

    def validate_cpf(self, value):
        return validate_cpf(value)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = super().create(validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    confirm_password = serializers.CharField()

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError('Nova senha e confirmação não conferem')
        return data
