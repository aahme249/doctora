'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppointmentType } from '@/lib/types';
import { sendEmail } from '@/lib/sendEmail';
import { format } from 'date-fns';

function NewAppointmentForm() {
  const { patients, addAppointment } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get('patient') || '';

  const [form, setForm] = useState({
    patientId: preselectedPatient,
    date: '',
    time: '09:00',
    type: 'consultation' as AppointmentType,
    notes: '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patient = patients.find(p => p.id === form.patientId);
    if (!patient) return;
    addAppointment({ ...form, patientName: patient.name, status: 'scheduled' });
    if (patient.email) {
      sendEmail(patient.email, {
        type: 'appointment_confirmed',
        data: {
          name: patient.name,
          date: format(new Date(form.date + 'T00:00:00'), 'MMMM d, yyyy'),
          time: form.time,
          type: form.type,
          notes: form.notes,
        },
      });
    }
    router.push('/appointments');
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Schedule Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
          <select required value={form.patientId} onChange={e => set('patientId', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a patient...</option>
            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input required type="time" value={form.time} onChange={e => set('time', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="consultation">Consultation</option>
            <option value="follow-up">Follow-up</option>
            <option value="check-up">Check-up</option>
            <option value="emergency">Emergency</option>
            <option value="procedure">Procedure</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/appointments" className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            Schedule Appointment
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="New Appointment" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link href="/appointments" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
          <ArrowLeft size={16} /> Back to Appointments
        </Link>
        <Suspense fallback={<div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-400 text-sm">Loading...</div>}>
          <NewAppointmentForm />
        </Suspense>
      </main>
    </div>
  );
}
