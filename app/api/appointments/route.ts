import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';

export async function GET() {
  const rows = await db.select().from(appointments);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(appointments).values(body).returning();
  return NextResponse.json(row);
}
