import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

const DEFAULT_DEMO_USER = {
  id: 1,
  name: 'Alex Morgan',
  email: 'alex.morgan@learntrack.dev',
  targetCareerRole: 'Java Backend Developer',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : DEFAULT_DEMO_USER;
    } catch {
      return DEFAULT_DEMO_USER;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || 'demo-jwt-token');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Optionally check /users/me if backend is running, but never kick user out if offline
    if (token && token !== 'demo-jwt-token') {
      api
        .get('/users/me')
        .then((res) => {
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          }
        })
        .catch(() => {
          // Keep user logged in with local fallback
        });
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: newToken, id, name, email: userEmail, targetCareerRole } = res.data;
      const userData = { id, name, email: userEmail, targetCareerRole };
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (e) {
      // Offline fallback: log in as demo
      const userData = { ...DEFAULT_DEMO_USER, email };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken('demo-jwt-token');
      return userData;
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { token: newToken, id, name: userName, email: userEmail, targetCareerRole } = res.data;
      const userData = { id, name: userName, email: userEmail, targetCareerRole };
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      return userData;
    } catch (e) {
      // Offline fallback
      const userData = { id: 1, name, email, targetCareerRole: 'Java Backend Developer' };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken('demo-jwt-token');
      return userData;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const merged = { ...prev, ...userData };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user: user || DEFAULT_DEMO_USER,
    token: token || 'demo-jwt-token',
    loading,
    isAuthenticated: true, // Always true to bypass login barriers
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
