'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Stethoscope, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error ?? 'Invalid credentials.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-xl p-2.5">
            <Stethoscope size={22} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl">Doctora</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your health.<br />Your records.<br />All in one place.
          </h1>
          <p className="text-slate-400 text-lg">
            Doctors manage patients and appointments. Patients access their own health portal securely.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '500+', label: 'Patients managed' },
            { value: '99.9%', label: 'Uptime' },
            { value: 'HIPAA', label: 'Compliant design' },
            { value: '24/7', label: 'Access anywhere' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-slate-800 rounded-xl p-4">
              <p className="text-blue-400 font-bold text-xl">{value}</p>
              <p className="text-slate-400 text-sm mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Doctora</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in as a doctor or patient</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            New patient?{' '}
            <Link href="/register" className="text-blue-600 font-medium hover:underline">Create an account</Link>
          </p>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-xs font-semibold text-blue-700 mb-2">Doctor demo credentials</p>
            <p className="text-xs text-blue-600 font-mono">dr.hassan@doctora.com</p>
            <p className="text-xs text-blue-600 font-mono">doctor123</p>
            <button onClick={() => { setEmail('dr.hassan@doctora.com'); setPassword('doctor123'); setError(''); }}
              className="mt-2 text-xs text-blue-700 font-medium hover:underline">
              Fill automatically →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
