from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from accounts.views_pages import (
    DashboardView, UsuarioListView, UsuarioFormView, UsuarioEditView,
    OfertaListView, OfertaFormView, OfertaEditView, OfertaDizimistaView,
    DizimistaListView, ConfiguracoesView, IgrejaConfigView,
    TemaConfigView, ProfilePageView, ChangePasswordPageView,
    ApresentacaoView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('accounts.urls')),
    path('', include('ofertas.urls')),
    path('', include('dizimistas.urls')),
    path('', include('configapp.urls')),

    # Frontend pages
    path('apresentacao/', ApresentacaoView.as_view(), name='apresentacao'),
    path('', DashboardView.as_view(), name='dashboard'),
    path('usuarios/', UsuarioListView.as_view(), name='usuario-list'),
    path('usuarios/novo/', UsuarioFormView.as_view(), name='usuario-create'),
    path('usuarios/<int:pk>/', UsuarioEditView.as_view(), name='usuario-edit'),
    path('ofertas/', OfertaListView.as_view(), name='oferta-list'),
    path('ofertas/nova/', OfertaFormView.as_view(), name='oferta-create'),
    path('ofertas/<int:pk>/', OfertaEditView.as_view(), name='oferta-edit'),
    path('ofertas/dizimista/<int:pk>/', OfertaDizimistaView.as_view(), name='oferta-dizimista'),
    path('dizimistas/', DizimistaListView.as_view(), name='dizimista-list'),
    path('configuracoes/', ConfiguracoesView.as_view(), name='configuracoes'),
    path('configuracoes/igreja/', IgrejaConfigView.as_view(), name='config-igreja'),
    path('configuracoes/tema/', TemaConfigView.as_view(), name='config-tema'),
    path('perfil/', ProfilePageView.as_view(), name='profile'),
    path('alterar-senha/', ChangePasswordPageView.as_view(), name='change-password'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
