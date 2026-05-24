'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, Appointment, MedicalRecord } from './types';
import { samplePatients, sampleAppointments, sampleRecords } from './data';

interface AppContextType {
  patients: Patient[];
  appointments: Appointment[];
  records: MedicalRecord[];
  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addAppointment: (a: Omit<Appointment, 'id' | 'createdAt'>) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  addRecord: (r: Omit<MedicalRecord, 'id' | 'createdAt'>) => void;
  updateRecord: (id: string, updates: Partial<MedicalRecord>) => void;
  deleteRecord: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('doctora_data');
    if (stored) {
      const data = JSON.parse(stored);
      setPatients(data.patients ?? samplePatients);
      setAppointments(data.appointments ?? sampleAppointments);
      setRecords(data.records ?? sampleRecords);
    } else {
      setPatients(samplePatients);
      setAppointments(sampleAppointments);
      setRecords(sampleRecords);
    }
  }, []);

  useEffect(() => {
    if (patients.length || appointments.length || records.length) {
      localStorage.setItem('doctora_data', JSON.stringify({ patients, appointments, records }));
    }
  }, [patients, appointments, records]);

  const addPatient = (p: Omit<Patient, 'id' | 'createdAt'>) => {
    setPatients(prev => [...prev, { ...p, id: generateId(), createdAt: new Date().toISOString() }]);
  };
  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };
  const deletePatient = (id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addAppointment = (a: Omit<Appointment, 'id' | 'createdAt'>) => {
    setAppointments(prev => [...prev, { ...a, id: generateId(), createdAt: new Date().toISOString() }]);
  };
  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };
  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addRecord = (r: Omit<MedicalRecord, 'id' | 'createdAt'>) => {
    setRecords(prev => [...prev, { ...r, id: generateId(), createdAt: new Date().toISOString() }]);
  };
  const updateRecord = (id: string, updates: Partial<MedicalRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };
  const deleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return (
    <AppContext.Provider value={{
      patients, appointments, records,
      addPatient, updatePatient, deletePatient,
      addAppointment, updateAppointment, deleteAppointment,
      addRecord, updateRecord, deleteRecord,
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
