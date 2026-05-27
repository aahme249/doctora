import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { appointmentRequests } from '@/lib/db/schema';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [row] = await db.update(appointmentRequests).set(body).where(eq(appointmentRequests.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
  return NextResponse.json({ ok: true });
}
