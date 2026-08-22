/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('gentora_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/auth/me');
      if (res.success) {
        setUser(res.data);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Auth check failed:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.success && res.data.token) {
      localStorage.setItem('gentora_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.success && res.data.token) {
      localStorage.setItem('gentora_token', res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('gentora_token');
    localStorage.removeItem('gentora_guest_cart');
    localStorage.removeItem('gentora_wishlist');
    setUser(null);
    window.dispatchEvent(new CustomEvent('gentora-user-logout'));
  };

  const updateProfile = async (data) => {
    const res = await API.put('/auth/profile', data);
    if (res.success) {
      setUser((prev) => ({ ...prev, ...res.data }));
      return res.data;
    }
  };

  const hasPermission = (permissionSlug) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'SUPER_ADMIN') return true;
    return Array.isArray(user.permissions) && user.permissions.includes(permissionSlug);
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    const current = (user.role || '').toLowerCase();
    if (current === 'super_admin') return true;
    return roles.map((r) => r.toLowerCase()).includes(current);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        hasPermission,
        hasRole,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
