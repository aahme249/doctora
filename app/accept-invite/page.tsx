'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { Stethoscope, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface InviteInfo {
  name: string;
  email: string;
}

function AcceptInviteForm() {
  const { acceptInvite } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [checking, setChecking] = useState(true);
  const [inviteError, setInviteError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setInviteError('This invite link is missing a token.');
      setChecking(false);
      return;
    }
    apiFetch<InviteInfo>(`/api/invites/${token}`)
      .then(setInvite)
      .catch(err => setInviteError(err instanceof ApiError ? err.message : 'Could not verify this invite link.'))
      .finally(() => setChecking(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await acceptInvite(token, password);
    if (!result.ok) {
      setError(result.error ?? 'Could not accept this invite.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.replace('/portal'), 2000);
  }

  if (checking) {
    return <p className="text-gray-400 text-sm text-center">Checking your invite…</p>;
  }

  if (inviteError || !invite) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={26} className="text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Invite link invalid</h2>
        <p className="text-gray-500 mb-6">{inviteError || 'This invite could not be found.'}</p>
        <Link href="/login" className="text-blue-600 font-medium hover:underline">Back to sign in</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-gray-500 mb-6">Redirecting to your portal…</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome, {invite.name}</h2>
      <p className="text-gray-500 mb-6">Set a password for <span className="font-medium">{invite.email}</span> to activate your portal account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <input required type={showPassword ? 'text' : 'password'} value={password}
              onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
          <input required type="password" value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={15} className="shrink-0" />{error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Activating…' : 'Activate account'}
        </button>
      </form>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-blue-600 rounded-lg p-1.5">
            <Stethoscope size={18} className="text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Doctora</span>
        </div>
        <Suspense fallback={<p className="text-gray-400 text-sm text-center">Loading…</p>}>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
