import { NextRequest, NextResponse } from 'next/server';
import { renderEmail, EmailData } from '@/lib/emails';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const body: { to: string; payload: EmailData } = await req.json();
  if (!body.to || !body.payload) {
    return NextResponse.json({ error: 'Missing to or payload' }, { status: 400 });
  }

  const { subject, html } = renderEmail(body.payload);

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: `Doctora Healthcare <${user}>`,
      to: body.to,
      subject,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
