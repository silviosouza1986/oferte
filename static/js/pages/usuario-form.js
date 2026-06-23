let editId = null;

document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user || user.cargo !== 'admin') {
    window.location.href = '/';
    return;
  }
  applyMasks();

  const pathParts = window.location.pathname.split('/');
  const idIndex = pathParts.indexOf('usuarios') + 1;
  const id = pathParts[idIndex];

  if (id && id !== 'novo') {
    editId = id;
    document.querySelector('.md-app-bar__title').textContent = 'Editar Usuário';
    carregarUsuario(id);
  }

  document.getElementById('usuario-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showProgress();

    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const cargo = document.getElementById('cargo').value;
    const is_active = document.getElementById('is_active').checked;
    const is_dizimista = document.getElementById('is_dizimista').checked;
    const password = document.getElementById('password').value;

    if (!validateCPF(cpf)) {
      mdSnackbar('CPF inválido', 'error');
      hideProgress();
      return;
    }

    const data = { nome, cpf, telefone, email, cargo, is_active, is_dizimista };
    if (password) data.password = password;

    try {
      if (editId) {
        await api.put(`/api/usuarios/${editId}/`, data);
        mdSnackbar('Usuário atualizado com sucesso', 'success');
      } else {
        await api.post('/api/usuarios/', data);
        mdSnackbar('Usuário criado com sucesso', 'success');
      }
      window.location.href = '/usuarios/';
    } catch (err) {
      const errors = err.data;
      let msg = 'Erro ao salvar usuário';
      if (typeof errors === 'object') {
        msg = Object.values(errors).flat().join('. ');
      }
      mdSnackbar(msg, 'error');
    } finally {
      hideProgress();
    }
  });
});

async function carregarUsuario(id) {
  showProgress();
  try {
    const user = await api.get(`/api/usuarios/${id}/`);
    document.getElementById('nome').value = user.nome;
    document.getElementById('cpf').value = user.cpf;
    document.getElementById('telefone').value = user.telefone;
    document.getElementById('email').value = user.email;
    document.getElementById('cargo').value = user.cargo;
    document.getElementById('is_active').checked = user.is_active;
    document.getElementById('is_dizimista').checked = user.is_dizimista;
    document.querySelector('#password-field label').textContent = 'Nova senha (deixe em branco para manter)';
  } catch (err) {
    mdSnackbar('Erro ao carregar dados do usuário', 'error');
  } finally {
    hideProgress();
  }
}
