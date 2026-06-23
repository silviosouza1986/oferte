document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user || user.cargo !== 'admin') {
    window.location.href = '/';
    return;
  }
  const pathParts = window.location.pathname.split('/');
  const idIndex = pathParts.indexOf('dizimista') + 1;
  const dizimistaId = pathParts[idIndex];

  if (dizimistaId) {
    carregarDizimista(dizimistaId);
    listarOfertas(dizimistaId);
  }
});

async function carregarDizimista(id) {
  try {
    const user = await api.get(`/api/usuarios/${id}/`);
    document.getElementById('page-title').textContent = `Ofertas de ${user.nome}`;
    document.getElementById('dizimista-nome').textContent = user.nome;
    document.getElementById('dizimista-cpf').textContent = formatCPF(user.cpf);

    const avatar = document.getElementById('dizimista-avatar');
    avatar.textContent = getInitials(user.nome);
    avatar.style.backgroundColor = localStorage.getItem('theme_primary_color') || '#6750A4';
  } catch (e) {
    mdSnackbar('Erro ao carregar dados do dizimista', 'error');
  }
}

async function listarOfertas(dizimistaId) {
  showProgress();
  try {
    const data = await api.get(`/api/ofertas/?dizimista=${dizimistaId}`);
    const tbody = document.getElementById('ofertas-tbody');
    tbody.innerHTML = '';

    if (data.results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhuma oferta encontrada</td></tr>';
      document.getElementById('total-count').textContent = '0';
      document.getElementById('total-valor').textContent = 'R$ 0,00';
      document.getElementById('ultima-data').textContent = '—';
    } else {
      let total = 0;
      data.results.forEach(oferta => {
        total += parseFloat(oferta.valor);
        const tipoChip = {
          'dinheiro': '<span class="md-chip md-chip--info">Dinheiro</span>',
          'cartao': '<span class="md-chip md-chip--warning">Cartão</span>',
          'pix': '<span class="md-chip md-chip--success">PIX</span>',
        }[oferta.tipo_pagamento] || oferta.tipo_pagamento;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${formatDate(oferta.data)}</td>
          <td><strong>${formatCurrency(oferta.valor)}</strong></td>
          <td class="hide-mobile">${tipoChip}</td>
          <td>
            <div style="display:flex;gap:8px;">
              <a href="/ofertas/${oferta.id}/" class="md-btn md-btn--tonal md-btn--small">Editar</a>
              <button class="md-btn md-btn--outlined md-btn--small" onclick="deletarOfertaDiz(${oferta.id})">Excluir</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      document.getElementById('total-count').textContent = data.results.length;
      document.getElementById('total-valor').textContent = formatCurrency(total);
      document.getElementById('ultima-data').textContent = formatDate(data.results[0].data);
    }
  } catch (err) {
    document.getElementById('ofertas-tbody').innerHTML = '<tr><td colspan="4" class="text-center text-error">Erro ao carregar ofertas</td></tr>';
  } finally {
    hideProgress();
  }
}

function deletarOfertaDiz(id) {
  mdDialog('Excluir Oferta', 'Tem certeza que deseja excluir esta oferta?', async () => {
    showProgress();
    try {
      await api.delete(`/api/ofertas/${id}/`);
      mdSnackbar('Oferta excluída com sucesso', 'success');
      location.reload();
    } catch (err) {
      mdSnackbar('Erro ao excluir oferta', 'error');
    } finally {
      hideProgress();
    }
  });
}
