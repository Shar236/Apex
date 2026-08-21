import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  authApi,
  clearAuth,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '../lib/api';
const AuthContext = createContext(null);

const normalizeUser = (candidate) => {
  if (!candidate || typeof candidate !== 'object') return null;
  const id = candidate._id || candidate.id || null;
  return {
    ...candidate,
    ...(id ? { _id: id, id } : {}),
    name: typeof candidate.name === 'string' ? candidate.name.trim() : '',
    email: typeof candidate.email === 'string' ? candidate.email.trim().toLowerCase() : '',
    phone: candidate.phone || null,
    phoneCountry: candidate.phoneCountry || null,
    profileImageUrl: candidate.profileImageUrl || null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setUser(normalizeUser(getStoredUser()));
    setIsAuthenticated(true);
    const res = await authApi.me();
    setLoading(false);
    if (res.success) {
      const nextUser = normalizeUser(res.user || res.data);
      setUser(nextUser);
      setStoredUser(nextUser);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      clearAuth();
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const register = async (data) => {
    setError(null);
    const res = await authApi.register(data);
    if (res.success) {
      setToken(res.token);
      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      setStoredUser(nextUser);
      setIsAuthenticated(true);
    } else {
      setError(res.message);
    }
    return res;
  };

  const login = async (data) => {
    setError(null);
    const res = await authApi.login(data);
    if (res.success) {
      setToken(res.token);
      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      setStoredUser(nextUser);
      setIsAuthenticated(true);
    } else {
      setError(res.message);
    }
    return res;
  };

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const forgotPassword = async (email) => {
    const res = await authApi.forgotPassword(email);
    return res;
  };

  const resetPassword = async (token, password) => {
    const res = await authApi.resetPassword(token, password);
    return res;
  };

  const refreshUser = async () => {
    const res = await authApi.me();
    if (res.success) {
      const nextUser = normalizeUser(res.user || res.data);
      setUser(nextUser);
      setStoredUser(nextUser);
      return { ...res, user: nextUser };
    }
    return res;
  };

  const updateAuthenticatedUser = useCallback((candidate) => {
    const nextUser = normalizeUser(candidate);
    if (!nextUser) return null;
    setUser(nextUser);
    setStoredUser(nextUser);
    return nextUser;
  }, []);

  const isAdmin = !!user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        updateAuthenticatedUser,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        refreshUser,
        isAdmin,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
