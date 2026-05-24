'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { sendEmail } from '@/lib/sendEmail';
import { format } from 'date-fns';

function NewRecordForm() {
  const { patients, addRecord } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatient = searchParams.get('patient') || '';

  const [form, setForm] = useState({
    patientId: preselectedPatient,
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medications: '',
    notes: '',
    followUp: '',
  });

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const patient = patients.find(p => p.id === form.patientId);
    if (!patient) return;
    addRecord({ ...form, patientName: patient.name });
    if (patient.email) {
      sendEmail(patient.email, {
        type: 'new_record',
        data: {
          name: patient.name,
          date: format(new Date(form.date + 'T00:00:00'), 'MMMM d, yyyy'),
          diagnosis: form.diagnosis,
          followUp: form.followUp
            ? format(new Date(form.followUp + 'T00:00:00'), 'MMMM d, yyyy')
            : '',
        },
      });
    }
    router.push('/records');
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Add Medical Record</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
            <select required value={form.patientId} onChange={e => set('patientId', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select a patient...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input required type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis *</label>
          <input required value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)}
            placeholder="e.g. Type 2 Diabetes, Hypertension Stage 1"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
          <textarea value={form.symptoms} onChange={e => set('symptoms', e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Treatment Plan</label>
          <textarea value={form.treatment} onChange={e => set('treatment', e.target.value)} rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medications Prescribed</label>
          <textarea value={form.medications} onChange={e => set('medications', e.target.value)} rows={2}
            placeholder="Drug name, dosage, frequency..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Follow-up Date</label>
          <input type="date" value={form.followUp} onChange={e => set('followUp', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/records" className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Cancel
          </Link>
          <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
            Save Record
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewRecordPage() {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="New Record" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link href="/records" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
          <ArrowLeft size={16} /> Back to Records
        </Link>
        <Suspense fallback={<div className="bg-white rounded-xl border border-gray-200 p-6 text-gray-400 text-sm">Loading...</div>}>
          <NewRecordForm />
        </Suspense>
      </main>
    </div>
  );
}
