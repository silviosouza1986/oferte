from rest_framework import generics
from accounts.models import User
from .serializers import DizimistaListSerializer


class DizimistaListView(generics.ListAPIView):
    serializer_class = DizimistaListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = User.objects.filter(is_dizimista=True).prefetch_related('ofertas')
        search = self.request.query_params.get('search', '')
        if search:
            qs = qs.filter(nome__icontains=search)
        return qs

    def get_serializer_context(self):
        context = super().get_serializer_context()
        mes = self.request.query_params.get('mes', '')
        ano = self.request.query_params.get('ano', '')
        if mes:
            context['mes'] = int(mes)
        if ano:
            context['ano'] = int(ano)
        return context
