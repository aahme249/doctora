import { EmailData } from './emails';

export async function sendEmail(to: string, payload: EmailData): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, payload }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? 'Email failed' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error sending email' };
  }
}
