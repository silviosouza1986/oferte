document.addEventListener('DOMContentLoaded', () => {
  const token = api.getToken();
  const user = api.getUser();

  if (window.location.pathname === '/login/' || window.location.pathname === '/apresentacao/') {
    if (window.location.pathname === '/login/' && token) {
      window.location.href = '/';
      return;
    }
  } else {
    if (!token) {
      window.location.href = '/login/';
      return;
    }
  }

  const primaryColor = localStorage.getItem('theme_primary_color');
  if (primaryColor) {
    applyTheme(primaryColor);
  } else if (user) {
    loadUserTheme();
  }
});

function applyTheme(hexColor) {
  const root = document.documentElement;
  root.style.setProperty('--md-sys-color-primary', hexColor);

  const lighter = hexToRgb(hexColor, 0.15);
  root.style.setProperty('--md-sys-color-primary-container', lighter);

  const onPrimary = getContrastColor(hexColor);
  root.style.setProperty('--md-sys-color-on-primary', onPrimary);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = hexColor;
}

function hexToRgb(hex, alpha = 1) {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getContrastColor(hex) {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

async function loadUserTheme() {
  try {
    const data = await api.get('/api/configuracao/tema/');
    if (data && data.theme_primary_color) {
      localStorage.setItem('theme_primary_color', data.theme_primary_color);
      applyTheme(data.theme_primary_color);
    }
  } catch (e) {
    // Silently fail
  }
}

function showProgress() {
  const el = document.getElementById('progress-bar');
  if (el) el.classList.add('md-progress--visible');
}

function hideProgress() {
  const el = document.getElementById('progress-bar');
  if (el) el.classList.remove('md-progress--visible');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatCPF(cpf) {
  if (!cpf) return '';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatPhone(phone) {
  if (!phone) return '';
  return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
