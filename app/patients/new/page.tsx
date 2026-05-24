'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { BloodType, Gender } from '@/lib/types';

export default function NewPatientPage() {
  const { addPatient } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', dateOfBirth: '', gender: 'Male' as Gender,
    phone: '', email: '', address: '',
    bloodType: 'O+' as BloodType,
    allergies: [] as string[], conditions: [] as string[],
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function addTag(field: 'allergies' | 'conditions', input: string, setInput: (v: string) => void) {
    const val = input.trim();
    if (val && !form[field].includes(val)) {
      setForm(f => ({ ...f, [field]: [...f[field], val] }));
    }
    setInput('');
  }

  function removeTag(field: 'allergies' | 'conditions', val: string) {
    setForm(f => ({ ...f, [field]: f[field].filter(v => v !== val) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPatient(form);
    router.push('/patients');
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="New Patient" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Link href="/patients" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-6">
          <ArrowLeft size={16} /> Back to Patients
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Add New Patient</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input required type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                <input required type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            {/* Allergies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {form.allergies.map(a => (
                  <span key={a} className="flex items-center gap-1 bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full">
                    {a}
                    <button type="button" onClick={() => removeTag('allergies', a)}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('allergies', allergyInput, setAllergyInput))}
                  placeholder="Type and press Enter or +"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => addTag('allergies', allergyInput, setAllergyInput)}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Conditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {form.conditions.map(c => (
                  <span key={c} className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full">
                    {c}
                    <button type="button" onClick={() => removeTag('conditions', c)}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={conditionInput} onChange={e => setConditionInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag('conditions', conditionInput, setConditionInput))}
                  placeholder="Type and press Enter or +"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="button" onClick={() => addTag('conditions', conditionInput, setConditionInput)}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/patients" className="flex-1 text-center px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700">
                Add Patient
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
