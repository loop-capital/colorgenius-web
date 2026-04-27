'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '@/types';


interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    getMe().then((res) => {
      if (res.data) {
        setUser(res.data);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, []);

  const login = useCallback((token: string, authUser: AuthUser) => {
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    React.createElement(AuthContext.Provider, {
      value: {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      },
    }, children)
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// Token stored in memory only (httpOnly cookie set by API handles persistence)
let authToken: string | null = null;

export function getToken(): string | null {
  return authToken;
}

export function setToken(token: string | null): void {
  authToken = token;
}
