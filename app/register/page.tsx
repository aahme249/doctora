'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/context';
import { sendEmail } from '@/lib/sendEmail';
import { useRouter } from 'next/navigation';
import { Stethoscope, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { BloodType, Gender } from '@/lib/types';

export default function RegisterPage() {
  const { registerPatient } = useAuth();
  const { addPatient } = useApp();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    dateOfBirth: '', gender: 'Female' as Gender, phone: '',
    bloodType: 'O+' as BloodType,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const result = registerPatient({
      email: form.email,
      password: form.password,
      name: form.name,
    });

    if (!result.ok) {
      setError(result.error ?? 'Registration failed.');
      setLoading(false);
      return;
    }

    // Create the linked patient record immediately
    addPatient({
      name: form.name,
      dateOfBirth: form.dateOfBirth || '2000-01-01',
      gender: form.gender,
      phone: form.phone,
      email: form.email,
      address: '',
      bloodType: form.bloodType,
      allergies: [],
      conditions: [],
    });

    // Send welcome email (non-blocking)
    sendEmail(form.email, { type: 'welcome', data: { name: form.name } });

    setSuccess(true);
    setLoading(false);
    // Auto-redirect to portal after showing success screen
    setTimeout(() => router.replace('/portal'), 2500);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account created!</h2>
          <p className="text-gray-500 mb-2">Welcome to Doctora, <span className="font-medium text-gray-800">{form.name}</span>.</p>
          <p className="text-sm text-gray-400 mb-6">A welcome email has been sent to <span className="font-medium">{form.email}</span>.</p>
          <p className="text-xs text-gray-400 mb-4">Redirecting to your portal…</p>
          <Link href="/portal" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
            Go to my portal →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-2/5 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-xl p-2.5">
            <Stethoscope size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">Doctora</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight mb-4">
            Join Doctora as a patient
          </h1>
          <p className="text-slate-400">
            Create your free account to access your appointments, medical records, and health updates — all in one place.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              'View your upcoming appointments',
              'Access your medical records',
              'Receive email health notifications',
              'Secure, private and always available',
            ].map(item => (
              <li key={item} className="flex items-start gap-2 text-slate-300 text-sm">
                <span className="text-green-400 mt-0.5">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-slate-500 text-xs">Already have an account?{' '}
          <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Doctora</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
          <p className="text-gray-500 mb-6">Patient registration — free and takes 1 minute</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Sarah Johnson"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood type</label>
                <select value={form.bloodType} onChange={e => set('bloodType', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input required type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password *</label>
              <input required type="password" value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
