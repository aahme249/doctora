import { NextRequest, NextResponse } from 'next/server';
import { renderEmail, EmailData } from '@/lib/emails';

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === 're_your_api_key_here') {
    // Email not configured — silently succeed so the rest of the app works
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body: { to: string; payload: EmailData } = await req.json();
  if (!body.to || !body.payload) {
    return NextResponse.json({ error: 'Missing to or payload' }, { status: 400 });
  }

  const { subject, html } = renderEmail(body.payload);
  const FROM = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `Doctora Healthcare <${FROM}>`,
      to: body.to,
      subject,
      html,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
