import { EmailData } from './emails';

export async function sendEmail(to: string, payload: EmailData): Promise<void> {
  try {
    await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, payload }),
    });
  } catch {
    // non-blocking — email failure should not break the UI
  }
}
