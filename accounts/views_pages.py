from django.views.generic import TemplateView


class DashboardView(TemplateView):
    template_name = 'pages/dashboard.html'


class UsuarioListView(TemplateView):
    template_name = 'accounts/usuario_list.html'


class UsuarioFormView(TemplateView):
    template_name = 'accounts/usuario_form.html'


class UsuarioEditView(TemplateView):
    template_name = 'accounts/usuario_form.html'


class OfertaListView(TemplateView):
    template_name = 'ofertas/oferta_list.html'


class OfertaFormView(TemplateView):
    template_name = 'ofertas/oferta_form.html'


class OfertaEditView(TemplateView):
    template_name = 'ofertas/oferta_form.html'


class OfertaDizimistaView(TemplateView):
    template_name = 'ofertas/oferta_dizimista.html'


class DizimistaListView(TemplateView):
    template_name = 'dizimistas/dizimista_list.html'


class ConfiguracoesView(TemplateView):
    template_name = 'pages/configuracoes.html'


class IgrejaConfigView(TemplateView):
    template_name = 'configapp/igreja_config.html'


class TemaConfigView(TemplateView):
    template_name = 'configapp/tema_config.html'


class ProfilePageView(TemplateView):
    template_name = 'configapp/profile.html'


class ChangePasswordPageView(TemplateView):
    template_name = 'configapp/change_password.html'


class ApresentacaoView(TemplateView):
    template_name = 'pages/apresentacao.html'
