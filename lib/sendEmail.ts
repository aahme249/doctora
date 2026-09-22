import { EmailData } from './emails';
import { apiFetch, ApiError } from './apiClient';

export async function sendEmail(to: string, payload: EmailData): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiFetch('/api/email', {
      method: 'POST',
      body: JSON.stringify({ to, payload }),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof ApiError ? err.message : 'Network error sending email' };
  }
}
