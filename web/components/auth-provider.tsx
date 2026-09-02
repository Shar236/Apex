'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, accountApi, clearAuth, getStoredUser, getToken, setStoredUser, setToken, type ApiResponse } from '@/lib/api';

export interface AuthUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  phone?: string | null;
  phoneCountry?: string | null;
  profileImageUrl?: string | null;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  register: (data: unknown) => Promise<ApiResponse>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<ApiResponse>;
  resendRegistrationOtp: (email: string) => Promise<ApiResponse>;
  login: (data: unknown) => Promise<ApiResponse>;
  logout: () => void;
  refreshUser: () => Promise<ApiResponse>;
  forgotPassword: (email: string) => Promise<ApiResponse>;
  resetPassword: (token: string, password: string) => Promise<ApiResponse>;
  updateAuthenticatedUser: (candidate: unknown) => AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const normalizeUser = (candidate: unknown): AuthUser | null => {
  if (!candidate || typeof candidate !== 'object') return null;
  const c = candidate as Record<string, unknown>;
  const id = (c._id as string) || (c.id as string) || undefined;
  return {
    ...(c as AuthUser),
    ...(id ? { _id: id, id } : {}),
    name: typeof c.name === 'string' ? c.name.trim() : '',
    email: typeof c.email === 'string' ? (c.email as string).trim().toLowerCase() : '',
    phone: (c.phone as string) || null,
    phoneCountry: (c.phoneCountry as string) || null,
    profileImageUrl: (c.profileImageUrl as string) || null,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const nextUser = normalizeUser(res.user ?? res.data);
      setUser(nextUser);
      setStoredUser(nextUser);
    } else {
      setIsAuthenticated(false);
      setUser(null);
      clearAuth();
    }
  }, []);

  useEffect(() => {
    // Rehydrate auth from the stored token on mount (no `window` during SSR) and
    // then revalidate against /api/auth/me. State-from-storage-plus-network is a
    // legitimate effect; it cannot be a lazy initializer under SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initAuth();
  }, [initAuth]);

  const register = async (data: unknown) => {
    setError(null);
    const res = await authApi.register(data);
    if (!res.success) setError(res.message ?? null);
    return res;
  };

  const verifyRegistrationOtp = async (email: string, otp: string) => {
    setError(null);
    const res = await authApi.verifyRegistrationOtp(email, otp);
    if (res.success) {
      setToken(res.token as string);
      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      setStoredUser(nextUser);
      setIsAuthenticated(true);
    } else {
      setError(res.message ?? null);
    }
    return res;
  };

  const resendRegistrationOtp = (email: string) => authApi.resendRegistrationOtp(email);

  const login = async (data: unknown) => {
    setError(null);
    const res = await authApi.login(data);
    if (res.success) {
      setToken(res.token as string);
      const nextUser = normalizeUser(res.user);
      setUser(nextUser);
      setStoredUser(nextUser);
      setIsAuthenticated(true);
    } else {
      setError(res.message ?? null);
    }
    return res;
  };

  const logout = useCallback(() => {
    if (getToken()) accountApi.logout().catch(() => {});
    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const forgotPassword = (email: string) => authApi.forgotPassword(email);
  const resetPassword = (token: string, password: string) => authApi.resetPassword(token, password);

  const refreshUser = async () => {
    const res = await authApi.me();
    if (res.success) {
      const nextUser = normalizeUser(res.user ?? res.data);
      setUser(nextUser);
      setStoredUser(nextUser);
      return { ...res, user: nextUser };
    }
    return res;
  };

  const updateAuthenticatedUser = useCallback((candidate: unknown) => {
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
        isAuthenticated,
        loading,
        error,
        isAdmin,
        register,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        login,
        logout,
        refreshUser,
        forgotPassword,
        resetPassword,
        updateAuthenticatedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
