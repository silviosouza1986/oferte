let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', () => {
  carregarDizimistas();
  listarOfertas();

  document.getElementById('filter-dizimista').addEventListener('change', () => {
    currentPage = 1;
    listarOfertas();
  });

  document.getElementById('filter-data-inicio').addEventListener('change', () => {
    currentPage = 1;
    listarOfertas();
  });

  document.getElementById('filter-data-fim').addEventListener('change', () => {
    currentPage = 1;
    listarOfertas();
  });

  document.getElementById('filter-tipo').addEventListener('change', () => {
    currentPage = 1;
    listarOfertas();
  });
});

async function carregarDizimistas() {
  try {
    const data = await api.get('/api/usuarios/?is_dizimista=true&ativos=true');
    const select = document.getElementById('filter-dizimista');
    data.results.forEach(user => {
      const opt = document.createElement('option');
      opt.value = user.id;
      opt.textContent = user.nome;
      select.appendChild(opt);
    });
  } catch (e) {}
}

async function listarOfertas() {
  showProgress();
  const dizimista = document.getElementById('filter-dizimista').value;
  const dataInicio = document.getElementById('filter-data-inicio').value;
  const dataFim = document.getElementById('filter-data-fim').value;
  const tipo = document.getElementById('filter-tipo').value;

  let url = `/api/ofertas/?page=${currentPage}`;
  if (dizimista) url += `&dizimista=${dizimista}`;
  if (dataInicio) url += `&data__gte=${dataInicio}`;
  if (dataFim) url += `&data__lte=${dataFim}`;
  if (tipo) url += `&tipo_pagamento=${tipo}`;

  try {
    const data = await api.get(url);
    const tbody = document.getElementById('ofertas-tbody');
    tbody.innerHTML = '';

    if (data.results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhuma oferta encontrada</td></tr>';
      document.getElementById('total-valor').textContent = 'R$ 0,00';
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
          <td><a href="/ofertas/dizimista/${oferta.dizimista}/" style="color:var(--md-sys-color-primary);text-decoration:none;">${escapeHtml(oferta.dizimista_nome)}</a></td>
          <td><strong>${formatCurrency(oferta.valor)}</strong></td>
          <td class="hide-mobile">${tipoChip}</td>
          <td>
            <div style="display:flex;gap:8px;">
              <a href="/ofertas/${oferta.id}/" class="md-btn md-btn--tonal md-btn--small">Editar</a>
              <button class="md-btn md-btn--outlined md-btn--small" onclick="deletarOferta(${oferta.id})">Excluir</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
      document.getElementById('total-valor').textContent = formatCurrency(total);
    }

    totalPages = Math.ceil(data.count / 10) || 1;
    renderPagination(document.getElementById('pagination'), totalPages, currentPage, (page) => {
      currentPage = page;
      listarOfertas();
    });
  } catch (err) {
    document.getElementById('ofertas-tbody').innerHTML = '<tr><td colspan="5" class="text-center text-error">Erro ao carregar ofertas</td></tr>';
  } finally {
    hideProgress();
  }
}

function deletarOferta(id) {
  mdDialog('Excluir Oferta', 'Tem certeza que deseja excluir esta oferta?', async () => {
    showProgress();
    try {
      await api.delete(`/api/ofertas/${id}/`);
      mdSnackbar('Oferta excluída com sucesso', 'success');
      listarOfertas();
    } catch (err) {
      mdSnackbar('Erro ao excluir oferta', 'error');
    } finally {
      hideProgress();
    }
  });
}
