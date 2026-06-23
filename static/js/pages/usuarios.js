let currentPage = 1;
let totalPages = 1;

document.addEventListener('DOMContentLoaded', () => {
  applyMasks();
  listarUsuarios();

  document.getElementById('search-input').addEventListener('input', debounce(() => {
    currentPage = 1;
    listarUsuarios();
  }));

  document.getElementById('filter-cargo').addEventListener('change', () => {
    currentPage = 1;
    listarUsuarios();
  });

  document.getElementById('filter-ativos').addEventListener('change', () => {
    currentPage = 1;
    listarUsuarios();
  });

  document.getElementById('filter-dizimistas').addEventListener('change', () => {
    currentPage = 1;
    listarUsuarios();
  });
});

async function listarUsuarios() {
  showProgress();
  const search = document.getElementById('search-input').value;
  const cargo = document.getElementById('filter-cargo').value;
  const ativos = document.getElementById('filter-ativos').checked;
  const dizimistas = document.getElementById('filter-dizimistas').checked;

  let url = `/api/usuarios/?page=${currentPage}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (cargo) url += `&cargo=${cargo}`;
  if (ativos) url += `&ativos=true`;
  if (dizimistas) url += `&is_dizimista=true`;

  try {
    const data = await api.get(url);
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '';

    if (data.results.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Nenhum usuário encontrado</td></tr>';
    } else {
      data.results.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${escapeHtml(user.nome)}</strong></td>
          <td class="hide-mobile">${escapeHtml(formatCPF(user.cpf))}</td>
          <td class="hide-mobile">${escapeHtml(formatPhone(user.telefone))}</td>
          <td>${escapeHtml(user.email)}</td>
          <td class="hide-mobile"><span class="md-chip">${user.cargo === 'admin' ? 'Administrador' : 'Dizimista'}</span></td>
          <td class="hide-mobile">${user.is_dizimista ? '<span class="md-chip md-chip--success">Sim</span>' : '<span class="md-chip">Não</span>'}</td>
          <td>${user.is_active ? '<span class="md-chip md-chip--success">Ativo</span>' : '<span class="md-chip md-chip--error">Inativo</span>'}</td>
          <td>
            <div style="display:flex;gap:8px;">
              <a href="/usuarios/${user.id}/" class="md-btn md-btn--tonal md-btn--small">Editar</a>
              <button class="md-btn md-btn--outlined md-btn--small" onclick="deletarUsuario(${user.id})">Excluir</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    totalPages = Math.ceil(data.count / 10) || 1;
    renderPagination(document.getElementById('pagination'), totalPages, currentPage, (page) => {
      currentPage = page;
      listarUsuarios();
    });
  } catch (err) {
    document.getElementById('usuarios-tbody').innerHTML = '<tr><td colspan="8" class="text-center text-error">Erro ao carregar usuários</td></tr>';
  } finally {
    hideProgress();
  }
}

function deletarUsuario(id) {
  mdDialog('Excluir Usuário', 'Tem certeza que deseja excluir este usuário?', async () => {
    showProgress();
    try {
      await api.delete(`/api/usuarios/${id}/`);
      mdSnackbar('Usuário excluído com sucesso', 'success');
      listarUsuarios();
    } catch (err) {
      mdSnackbar('Erro ao excluir usuário', 'error');
    } finally {
      hideProgress();
    }
  });
}
