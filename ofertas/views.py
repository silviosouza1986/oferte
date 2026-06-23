from rest_framework import viewsets, permissions
from .models import Oferta
from .serializers import OfertaSerializer
from accounts.views import IsAdminUser


class OfertaViewSet(viewsets.ModelViewSet):
    queryset = Oferta.objects.all().select_related('dizimista').order_by('-data')
    serializer_class = OfertaSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.cargo != 'admin':
            qs = qs.filter(dizimista=self.request.user)
        dizimista = self.request.query_params.get('dizimista', '')
        data_gte = self.request.query_params.get('data__gte', '')
        data_lte = self.request.query_params.get('data__lte', '')
        tipo = self.request.query_params.get('tipo_pagamento', '')

        if dizimista:
            qs = qs.filter(dizimista_id=dizimista)
        if data_gte:
            qs = qs.filter(data__gte=data_gte)
        if data_lte:
            qs = qs.filter(data__lte=data_lte)
        if tipo:
            qs = qs.filter(tipo_pagamento=tipo)

        return qs
