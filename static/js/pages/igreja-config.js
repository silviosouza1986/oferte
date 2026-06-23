document.addEventListener('DOMContentLoaded', () => {
  applyMasks();
  carregarConfig();

  const user = api.getUser();
  const isAdmin = user && user.cargo === 'admin';

  if (!isAdmin) {
    document.querySelectorAll('#igreja-form input, #igreja-form textarea').forEach(el => {
      el.disabled = true;
    });
    document.querySelector('#igreja-form button[type="submit"]').style.display = 'none';
    return;
  }

  document.getElementById('igreja-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showProgress();

    const data = {
      nome: document.getElementById('nome').value,
      cnpj: document.getElementById('cnpj').value,
      endereco: document.getElementById('endereco').value,
    };

    try {
      await api.put('/api/configuracao/igreja/', data);
      mdSnackbar('Configuração salva com sucesso', 'success');
    } catch (err) {
      mdSnackbar('Erro ao salvar configuração', 'error');
    } finally {
      hideProgress();
    }
  });
});

async function carregarConfig() {
  showProgress();
  try {
    const data = await api.get('/api/configuracao/igreja/');
    document.getElementById('nome').value = data.nome || '';
    document.getElementById('cnpj').value = data.cnpj || '';
    document.getElementById('endereco').value = data.endereco || '';
  } catch (err) {
    mdSnackbar('Erro ao carregar configuração', 'error');
  } finally {
    hideProgress();
  }
}
