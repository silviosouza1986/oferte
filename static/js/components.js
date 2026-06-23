function mdRipple(container) {
  container.addEventListener('mousedown', function (e) {
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const ripple = document.createElement('span');
    ripple.className = 'md-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
}

function mdSnackbar(message, type = 'info', duration = 3000) {
  let snackbar = document.getElementById('snackbar');
  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = 'snackbar';
    snackbar.className = 'md-snackbar';
    const text = document.createElement('span');
    text.id = 'snackbar-text';
    snackbar.appendChild(text);
    document.body.appendChild(snackbar);
  }
  const textEl = document.getElementById('snackbar-text');
  textEl.textContent = message;
  snackbar.className = 'md-snackbar';
  if (type === 'success') snackbar.classList.add('md-snackbar--success');
  if (type === 'error') snackbar.classList.add('md-snackbar--error');
  snackbar.classList.add('md-snackbar--visible');
  setTimeout(() => snackbar.classList.remove('md-snackbar--visible'), duration);
}

function mdDialog(title, message, onConfirm, onCancel) {
  let overlay = document.getElementById('dialog-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'dialog-overlay';
    overlay.className = 'md-dialog-overlay';
    overlay.innerHTML = `
      <div class="md-dialog">
        <div class="md-dialog__title" id="dialog-title"></div>
        <div class="md-dialog__content" id="dialog-message"></div>
        <div class="md-dialog__actions">
          <button class="md-btn md-btn--outlined" id="dialog-cancel">Cancelar</button>
          <button class="md-btn md-btn--danger" id="dialog-confirm">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-message').textContent = message;

  const confirmBtn = document.getElementById('dialog-confirm');
  const cancelBtn = document.getElementById('dialog-cancel');

  const cleanup = () => {
    overlay.classList.remove('md-dialog-overlay--open');
    confirmBtn.removeEventListener('click', handleConfirm);
    cancelBtn.removeEventListener('click', handleCancel);
  };

  const handleConfirm = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };

  const handleCancel = () => {
    cleanup();
    if (onCancel) onCancel();
  };

  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handleCancel();
  });

  overlay.classList.add('md-dialog-overlay--open');
}

function mdTogglePassword(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.type = field.type === 'password' ? 'text' : 'password';
  }
}

function applyMasks() {
  document.querySelectorAll('[data-mask="cpf"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });
  });

  document.querySelectorAll('[data-mask="phone"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      v = v.replace(/(\d{2})(\d)/, '($1) $2');
      v = v.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
      e.target.value = v;
    });
  });

  document.querySelectorAll('[data-mask="cnpj"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 14);
      v = v.replace(/(\d{2})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1/$2');
      v = v.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
      e.target.value = v;
    });
  });

  document.querySelectorAll('[data-mask="currency"]').forEach(input => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '');
      v = (parseInt(v) / 100).toFixed(2);
      v = v.replace('.', ',');
      v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      e.target.value = v;
    });
  });
}

function validateCPF(cpf) {
  const num = cpf.replace(/\D/g, '');
  if (num.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(num)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(num[i]) * (10 - i);
  let rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(num[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(num[i]) * (11 - i);
  rem = (sum * 10) % 11;
  if (rem === 10) rem = 0;
  if (rem !== parseInt(num[10])) return false;

  return true;
}

function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function renderPagination(container, totalPages, currentPage, onPageClick) {
  container.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'md-pagination__item';
    if (i === currentPage) btn.classList.add('md-pagination__item--active');
    btn.textContent = i;
    btn.addEventListener('click', () => onPageClick(i));
    container.appendChild(btn);
  }
}
