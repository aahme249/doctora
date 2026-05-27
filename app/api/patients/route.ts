import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';

export async function GET() {
  const rows = await db.select().from(patients);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(patients).values(body).returning();
  return NextResponse.json(row);
}
