import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'nt_token';
const CART_TOKEN_KEY = 'nt_cart_token';

// Inject Bearer token + cart token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const cartToken = localStorage.getItem(CART_TOKEN_KEY);
  if (cartToken) config.headers['X-Cart-Token'] = cartToken;
  return config;
});

// Capture cart token from response headers (set when guest cart is created)
api.interceptors.response.use((res) => {
  const cartToken = res.headers['x-cart-token'];
  if (cartToken) localStorage.setItem(CART_TOKEN_KEY, cartToken);
  return res;
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, r.data.token);
    localStorage.removeItem(CART_TOKEN_KEY); // switch to user cart
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (data) => {
    const r = await api.post('/auth/register', data);
    localStorage.setItem(TOKEN_KEY, r.data.token);
    localStorage.removeItem(CART_TOKEN_KEY);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CART_TOKEN_KEY);
    await api.post('/auth/logout').catch(() => {});
    setUser(null);
  };

  const isAdmin = !!user?.roles?.includes('admin');

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
