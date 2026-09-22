'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Patient, Appointment, MedicalRecord, AppointmentRequest } from './types';
import { apiFetch } from './apiClient';
import { useAuth } from './auth';

interface AppContextType {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  appointmentRequests: AppointmentRequest[];
  isLoading: boolean;
  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => Promise<void>;
  updatePatient: (id: string, updates: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addRecord: (r: Omit<MedicalRecord, 'id' | 'createdAt'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<MedicalRecord>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  addAppointmentRequest: (r: Omit<AppointmentRequest, 'id' | 'createdAt'>) => Promise<string>;
  updateAppointmentRequest: (id: string, updates: Partial<AppointmentRequest>) => Promise<void>;
  deleteAppointmentRequest: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isAuthenticated || !user) {
        setPatients([]);
        setAppointments([]);
        setRecords([]);
        setAppointmentRequests([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [p, a, r] = await Promise.all([
          apiFetch<Patient[]>('/api/patients'),
          apiFetch<Appointment[]>('/api/appointments'),
          apiFetch<MedicalRecord[]>('/api/records'),
        ]);
        const req = user.role === 'doctor' ? await apiFetch<AppointmentRequest[]>('/api/appointment-requests') : [];
        if (cancelled) return;
        setPatients(p);
        setAppointments(a);
        setRecords(r);
        setAppointmentRequests(req);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const addPatient = useCallback(async (p: Omit<Patient, 'id' | 'createdAt'>) => {
    const patient: Patient = { ...p, id: generateId(), createdAt: new Date().toISOString() };
    const created = await apiFetch<Patient>('/api/patients', { method: 'POST', body: JSON.stringify(patient) });
    setPatients(prev => [...prev, created]);
  }, []);
  const updatePatient = useCallback(async (id: string, updates: Partial<Patient>) => {
    const updated = await apiFetch<Patient>(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    setPatients(prev => prev.map(p => p.id === id ? updated : p));
  }, []);
  const deletePatient = useCallback(async (id: string) => {
    await apiFetch(`/api/patients/${id}`, { method: 'DELETE' });
    setPatients(prev => prev.filter(p => p.id !== id));
  }, []);

  const addAppointment = useCallback(async (a: Omit<Appointment, 'id' | 'createdAt'>) => {
    const appointment: Appointment = { ...a, id: generateId(), createdAt: new Date().toISOString() };
    const created = await apiFetch<Appointment>('/api/appointments', { method: 'POST', body: JSON.stringify(appointment) });
    setAppointments(prev => [...prev, created]);
  }, []);
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    const updated = await apiFetch<Appointment>(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
  }, []);
  const deleteAppointment = useCallback(async (id: string) => {
    await apiFetch(`/api/appointments/${id}`, { method: 'DELETE' });
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  const addRecord = useCallback(async (r: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
    const record: MedicalRecord = { ...r, id: generateId(), createdAt: new Date().toISOString() };
    const created = await apiFetch<MedicalRecord>('/api/records', { method: 'POST', body: JSON.stringify(record) });
    setRecords(prev => [...prev, created]);
  }, []);
  const updateRecord = useCallback(async (id: string, updates: Partial<MedicalRecord>) => {
    const updated = await apiFetch<MedicalRecord>(`/api/records/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    setRecords(prev => prev.map(r => r.id === id ? updated : r));
  }, []);
  const deleteRecord = useCallback(async (id: string) => {
    await apiFetch(`/api/records/${id}`, { method: 'DELETE' });
    setRecords(prev => prev.filter(r => r.id !== id));
  }, []);

  const addAppointmentRequest = useCallback(async (r: Omit<AppointmentRequest, 'id' | 'createdAt'>) => {
    const request: AppointmentRequest = { ...r, id: generateId(), createdAt: new Date().toISOString() };
    const created = await apiFetch<AppointmentRequest>('/api/appointment-requests', { method: 'POST', body: JSON.stringify(request) });
    setAppointmentRequests(prev => [...prev, created]);
    return created.id;
  }, []);
  const updateAppointmentRequest = useCallback(async (id: string, updates: Partial<AppointmentRequest>) => {
    const updated = await apiFetch<AppointmentRequest>(`/api/appointment-requests/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    setAppointmentRequests(prev => prev.map(r => r.id === id ? updated : r));
  }, []);
  const deleteAppointmentRequest = useCallback(async (id: string) => {
    await apiFetch(`/api/appointment-requests/${id}`, { method: 'DELETE' });
    setAppointmentRequests(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      patients, appointments, records, appointmentRequests, isLoading,
      addPatient, updatePatient, deletePatient,
      addAppointment, updateAppointment, deleteAppointment,
      addRecord, updateRecord, deleteRecord,
      addAppointmentRequest, updateAppointmentRequest, deleteAppointmentRequest,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
