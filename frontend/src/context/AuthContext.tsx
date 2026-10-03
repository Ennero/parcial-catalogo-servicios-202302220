'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, setAuthToken } from '../lib/api';

interface User {
  id: number;
  nombre: string;
  username: string;
  email: string;
  rol: 'administrador' | 'consulta';
  activo: boolean;
  puesto?: {
    id: number;
    codigo: string;
    nombre: string;
    seccion?: {
      id: number;
      codigo: string;
      nombre: string;
    };
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isConsulta: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  isAdmin: false,
  isConsulta: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = getAuthToken();
    if (savedToken) {
      setToken(savedToken);
      api.auth
        .me()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          setAuthToken(null);
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    const res = await api.auth.login(identifier, pass);
    setAuthToken(res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignorar errores de logout si el token ya expiró
    } finally {
      setAuthToken(null);
      setToken(null);
      setUser(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const isAdmin = user?.rol === 'administrador';
  const isConsulta = user?.rol === 'consulta';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isConsulta,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
