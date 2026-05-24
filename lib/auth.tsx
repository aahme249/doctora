'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'doctor' | 'patient';

export interface UserAccount {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  patientId?: string;
  createdAt: string;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  registerPatient: (data: Omit<UserAccount, 'id' | 'role' | 'createdAt'>) => { ok: boolean; error?: string };
  getAccounts: () => UserAccount[];
  linkPatient: (userId: string, patientId: string) => void;
}

const USERS_KEY = 'doctora_users';
const SESSION_KEY = 'doctora_session';

const DOCTOR_ACCOUNT: UserAccount = {
  id: 'doctor-1',
  email: 'dr.hassan@doctora.com',
  password: 'doctor123',
  role: 'doctor',
  name: 'Dr. Hassan',
  createdAt: '2024-01-01T00:00:00Z',
};

function loadAccounts(): UserAccount[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const accounts: UserAccount[] = stored ? JSON.parse(stored) : [];
    // Always use the current hardcoded doctor account so credential changes take effect immediately
    const withoutDoctor = accounts.filter(a => a.id !== DOCTOR_ACCOUNT.id);
    return [DOCTOR_ACCOUNT, ...withoutDoctor];
  } catch {
    return [DOCTOR_ACCOUNT];
  }
}

function saveAccounts(accounts: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(accounts));
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const accounts = loadAccounts();
      const user = accounts.find(a => a.id === sessionId) ?? null;
      setState({ user, isAuthenticated: !!user });
    }
    setReady(true);
  }, []);

  function login(email: string, password: string) {
    const accounts = loadAccounts();
    const user = accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!user) return { ok: false, error: 'Invalid email or password.' };
    localStorage.setItem(SESSION_KEY, user.id);
    setState({ user, isAuthenticated: true });
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setState({ user: null, isAuthenticated: false });
  }

  function registerPatient(data: Omit<UserAccount, 'id' | 'role' | 'createdAt'>) {
    const accounts = loadAccounts();
    if (accounts.find(a => a.email.toLowerCase() === data.email.toLowerCase())) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    const newUser: UserAccount = {
      ...data,
      id: Math.random().toString(36).slice(2, 10),
      role: 'patient',
      createdAt: new Date().toISOString(),
    };
    saveAccounts([...accounts, newUser]);
    localStorage.setItem(SESSION_KEY, newUser.id);
    setState({ user: newUser, isAuthenticated: true });
    return { ok: true };
  }

  function getAccounts() {
    return loadAccounts();
  }

  function linkPatient(userId: string, patientId: string) {
    const accounts = loadAccounts();
    const updated = accounts.map(a => a.id === userId ? { ...a, patientId } : a);
    saveAccounts(updated);
    setState(s => s.user?.id === userId ? { ...s, user: { ...s.user!, patientId } } : s);
  }

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ ...state, login, logout, registerPatient, getAccounts, linkPatient }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
