import axios from 'axios';

// Uses Vite proxy in dev; same-origin in prod. Cookies carry the auth token.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
    return Promise.reject(new Error(message));
  }
);

export default api;
