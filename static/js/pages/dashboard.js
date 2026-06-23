document.addEventListener('DOMContentLoaded', () => {
  carregarDashboard();
});

async function carregarDashboard() {
  showProgress();
  const token = api.getToken();
  if (!token) {
    window.location.href = '/login/';
    return;
  }

  try {
    const usuarios = await api.get('/api/usuarios/');
    if (usuarios) {
      document.getElementById('total-usuarios').textContent = usuarios.count || 0;
    }
  } catch (e) {}

  try {
    const dizimistas = await api.get('/api/dizimistas/');
    if (dizimistas) {
      document.getElementById('total-dizimistas').textContent = dizimistas.count || dizimistas.length || 0;
    }
  } catch (e) {
    document.getElementById('total-dizimistas').textContent = '—';
  }

  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  try {
    const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate();
    const dataFim = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    const ofertasMes = await api.get(`/api/ofertas/?data__gte=${dataInicio}&data__lte=${dataFim}`);
    const ofertasArr = ofertasMes ? ofertasMes.results || [] : [];
    document.getElementById('total-ofertas-mes').textContent = ofertasArr.length;

    const totalValor = ofertasArr.reduce((acc, o) => acc + parseFloat(o.valor), 0);
    document.getElementById('total-valor-mes').textContent = formatCurrency(totalValor);
  } catch (e) {
    document.getElementById('total-ofertas-mes').textContent = '—';
    document.getElementById('total-valor-mes').textContent = '—';
  }

  await carregarGrafico();
  hideProgress();
}

async function carregarGrafico() {
  try {
    const hoje = new Date();
    const container = document.getElementById('chart-bars');
    if (!container) return;

    container.innerHTML = '<div style="width:100%;text-align:center;color:var(--md-sys-color-on-surface-variant);padding:24px;">Carregando gráfico...</div>';

    const labels = [];
    const valores = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = d.getMonth() + 1;
      const ano = d.getFullYear();
      const nomeMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][d.getMonth()];
      labels.push(`${nomeMes}/${ano}`);

      const ultimoDia = new Date(ano, mes, 0).getDate();
      const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const fim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

      const data = await api.get(`/api/ofertas/?data__gte=${inicio}&data__lte=${fim}`);
      const results = data ? data.results || [] : [];
      const total = results.reduce((acc, o) => acc + parseFloat(o.valor), 0);
      valores.push(total);
    }

    const max = Math.max(...valores, 1);
    container.innerHTML = '';

    valores.forEach((v, i) => {
      const height = Math.max((v / max) * 100, 4);
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${height}px`;
      bar.title = formatCurrency(v);
      bar.innerHTML = `<div class="chart-bar__label">${labels[i]}</div>`;
      container.appendChild(bar);
    });
  } catch (e) {
    const container = document.getElementById('chart-bars');
    if (container) {
      container.innerHTML = '<div style="width:100%;text-align:center;color:var(--md-sys-color-on-surface-variant);padding:24px;">Gráfico indisponível</div>';
    }
  }
}
