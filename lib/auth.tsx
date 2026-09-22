'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch, ApiError, setToken, clearToken, getToken } from './apiClient';
import { BloodType, Gender } from './types';

export type UserRole = 'doctor' | 'patient';

export interface UserAccount {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  patientId?: string;
}

export interface PatientRegistration {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  phone: string;
  bloodType: BloodType;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  registerPatient: (data: PatientRegistration) => Promise<{ ok: boolean; error?: string }>;
  acceptInvite: (token: string, password: string) => Promise<{ ok: boolean; error?: string }>;
}

interface AuthResponse {
  token: string;
  user: UserAccount;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const token = getToken();
      if (!token) {
        setReady(true);
        return;
      }
      try {
        const user = await apiFetch<UserAccount>('/api/auth/me');
        setState({ user, isAuthenticated: true });
      } catch {
        clearToken();
      }
      setReady(true);
    }
    restoreSession();
  }, []);

  async function login(email: string, password: string) {
    try {
      const { token, user } = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(token);
      setState({ user, isAuthenticated: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'Network error signing in.' };
    }
  }

  function logout() {
    clearToken();
    setState({ user: null, isAuthenticated: false });
  }

  async function registerPatient(data: PatientRegistration) {
    try {
      const { token, user } = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setToken(token);
      setState({ user, isAuthenticated: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'Network error registering.' };
    }
  }

  async function acceptInvite(token: string, password: string) {
    try {
      const { token: authToken, user } = await apiFetch<AuthResponse>('/api/auth/accept-invite', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setToken(authToken);
      setState({ user, isAuthenticated: true });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof ApiError ? err.message : 'Network error accepting invite.' };
    }
  }

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, registerPatient, acceptInvite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
