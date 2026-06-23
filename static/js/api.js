let isRefreshing = false;

const api = {
  getToken() {
    return localStorage.getItem('access_token');
  },

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  async _refreshToken() {
    const refresh = this.getRefreshToken();
    if (!refresh) return false;
    try {
      const response = await fetch('/api/auth/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      this.setTokens(data.access, data.refresh || refresh);
      return true;
    } catch {
      return false;
    }
  },

  async request(method, url, data = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      if (response.status === 401 && this.getToken() && !isRefreshing) {
        isRefreshing = true;
        const refreshed = await this._refreshToken();
        isRefreshing = false;
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.getToken()}`;
          config.headers = headers;
          const retry = await fetch(url, config);
          if (retry.ok) {
            const json = await retry.json();
            return json;
          }
          if (retry.status === 401) {
            this.clearTokens();
            window.location.href = '/login/';
            return null;
          }
          const json = await retry.json();
          throw { status: retry.status, data: json };
        }
        this.clearTokens();
        window.location.href = '/login/';
        return null;
      }
      const json = await response.json();
      if (!response.ok) {
        throw { status: response.status, data: json };
      }
      return json;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, data: { error: 'Erro de conexão' } };
    }
  },

  get(url) { return this.request('GET', url); },
  post(url, data) { return this.request('POST', url, data); },
  put(url, data) { return this.request('PUT', url, data); },
  delete(url) { return this.request('DELETE', url); },
};
