let editId = null;

document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user || user.cargo !== 'admin') {
    window.location.href = '/';
    return;
  }
  applyMasks();

  const pathParts = window.location.pathname.split('/');
  const idIndex = pathParts.indexOf('ofertas') + 1;
  const id = pathParts[idIndex];

  if (id && id !== 'nova') {
    editId = id;
    document.querySelector('.md-app-bar__title').textContent = 'Editar Oferta';
    carregarOferta(id);
  }

  carregarDizimistasSelect();

  document.getElementById('oferta-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    showProgress();

    const valorRaw = document.getElementById('valor').value.replace(/\./g, '').replace(',', '.');
    const dizimista = document.getElementById('dizimista').value;
    const data = document.getElementById('data').value;
    const tipo_pagamento = document.getElementById('tipo_pagamento').value;

    if (!dizimista) {
      mdSnackbar('Selecione um dizimista', 'error');
      hideProgress();
      return;
    }

    const payload = { valor: valorRaw, dizimista: parseInt(dizimista), data, tipo_pagamento };

    try {
      if (editId) {
        await api.put(`/api/ofertas/${editId}/`, payload);
        mdSnackbar('Oferta atualizada com sucesso', 'success');
      } else {
        await api.post('/api/ofertas/', payload);
        mdSnackbar('Oferta criada com sucesso', 'success');
      }
      window.location.href = '/ofertas/';
    } catch (err) {
      const errors = err.data;
      let msg = 'Erro ao salvar oferta';
      if (typeof errors === 'object') {
        msg = Object.values(errors).flat().join('. ');
      }
      mdSnackbar(msg, 'error');
    } finally {
      hideProgress();
    }
  });
});

async function carregarDizimistasSelect() {
  try {
    const data = await api.get('/api/usuarios/?is_dizimista=true&ativos=true');
    const select = document.getElementById('dizimista');
    data.results.forEach(user => {
      const opt = document.createElement('option');
      opt.value = user.id;
      opt.textContent = user.nome;
      select.appendChild(opt);
    });
  } catch (e) {
    mdSnackbar('Erro ao carregar dizimistas', 'error');
  }
}

async function carregarOferta(id) {
  showProgress();
  try {
    const oferta = await api.get(`/api/ofertas/${id}/`);
    document.getElementById('dizimista').value = oferta.dizimista;
    const v = parseFloat(oferta.valor).toFixed(2).replace('.', ',');
    document.getElementById('valor').value = v;
    document.getElementById('data').value = oferta.data;
    document.getElementById('tipo_pagamento').value = oferta.tipo_pagamento;
  } catch (err) {
    mdSnackbar('Erro ao carregar oferta', 'error');
  } finally {
    hideProgress();
  }
}
