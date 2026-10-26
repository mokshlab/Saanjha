import axios from 'axios';

const TOKEN_KEY = 'saanjhaToken';
const USER_KEY = 'saanjhaUser';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem('saanjhaLoggedIn', 'true');
  localStorage.setItem('saanjhaName', user.name || '');
  localStorage.setItem('saanjhaEmail', user.email || '');
  localStorage.setItem('saanjhaLoggedInEmail', user.email || '');
}

export function clearSession() {
  [TOKEN_KEY, USER_KEY, 'saanjhaLoggedIn', 'saanjhaName', 'saanjhaEmail', 'saanjhaLoggedInEmail'].forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export default api;
