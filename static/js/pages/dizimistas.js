document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user || user.cargo !== 'admin') {
    window.location.href = '/';
    return;
  }
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const mesSelect = document.getElementById('filter-mes');
  mesSelect.value = mesAtual;

  const anoSelect = document.getElementById('filter-ano');
  for (let a = anoAtual - 2; a <= anoAtual + 1; a++) {
    const opt = document.createElement('option');
    opt.value = a;
    opt.textContent = a;
    anoSelect.appendChild(opt);
  }
  anoSelect.value = anoAtual;

  listarDizimistas();

  mesSelect.addEventListener('change', listarDizimistas);
  anoSelect.addEventListener('change', listarDizimistas);
});

async function listarDizimistas() {
  showProgress();
  const mes = document.getElementById('filter-mes').value;
  const ano = document.getElementById('filter-ano').value;

  try {
    let response = await api.get(`/api/dizimistas/?mes=${mes}&ano=${ano}`);
    const grid = document.getElementById('dizimistas-grid');
    grid.innerHTML = '';

    let totalOfertou = 0;
    let totalNaoOfertou = 0;

    let items = response.results || response;
    let totalCount = response.count || items.length;

    if (items.length === 0) {
      grid.innerHTML = '<div class="text-center text-muted" style="grid-column:1/-1;padding:48px;">Nenhum dizimista encontrado</div>';
    } else {
      const naoOfertou = items.filter(d => d.status === 'nao_ofertou');
      const ofertou = items.filter(d => d.status === 'ofertou');

      naoOfertou.forEach(d => grid.appendChild(criarCard(d)));
      ofertou.forEach(d => grid.appendChild(criarCard(d)));

      totalNaoOfertou = naoOfertou.length;
      totalOfertou = ofertou.length;
    }

    document.getElementById('total-dizimistas').textContent = totalCount;
    document.getElementById('total-ofertou').textContent = totalOfertou;
    document.getElementById('total-nao-ofertou').textContent = totalNaoOfertou;
  } catch (err) {
    document.getElementById('dizimistas-grid').innerHTML = '<div class="text-center text-error" style="grid-column:1/-1;padding:48px;">Erro ao carregar dizimistas</div>';
  } finally {
    hideProgress();
  }
}

function criarCard(dizimista) {
  const card = document.createElement('div');
  card.className = 'md-card md-card--elevated';
  card.style.animation = 'slideUp 0.3s ease';

  const isOfertou = dizimista.status === 'ofertou';

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
      <div class="md-avatar" style="background-color:${isOfertou ? '#2E7D32' : '#C62828'};">${escapeHtml(getInitials(dizimista.nome))}</div>
      <div style="flex:1;">
        <div style="font-size:16px;font-weight:500;">${escapeHtml(dizimista.nome)}</div>
        <div class="text-small text-muted">${escapeHtml(formatCPF(dizimista.cpf))}</div>
        <div class="text-small text-muted">${escapeHtml(formatPhone(dizimista.telefone))}</div>
      </div>
      <span class="md-chip ${isOfertou ? 'md-chip--success' : 'md-chip--error'}">${isOfertou ? 'Ofertou' : 'Não ofertou'}</span>
    </div>
    <div class="md-divider"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;">
      <div>
        <div class="text-small text-muted">Total no mês</div>
        <div style="font-weight:700;">${formatCurrency(dizimista.total_ofertas_valor)}</div>
      </div>
      <div>
        <div class="text-small text-muted">Última oferta</div>
        <div>${dizimista.ultima_oferta_data ? formatDate(dizimista.ultima_oferta_data) : '—'}</div>
      </div>
      <a href="/ofertas/dizimista/${dizimista.id}/" class="md-btn md-btn--tonal md-btn--small" style="text-decoration:none;">Ver ofertas</a>
    </div>
  `;

  return card;
}
