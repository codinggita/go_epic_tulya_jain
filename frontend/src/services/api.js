import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// IMPORTANT: Do NOT dispatch logout or redirect on 401 here.
// Doing so causes any expired-token API call to kick the user out of the dashboard.
// Individual pages handle 401s by showing cached data or a retry button.
// Only clear the stored token so the next request won't send an invalid one.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear the expired token from storage so future requests won't retry with it
      // but do NOT touch Redux state — the user stays on the current page
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
