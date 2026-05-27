import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { records } from '@/lib/db/schema';

export async function GET() {
  const rows = await db.select().from(records);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(records).values(body).returning();
  return NextResponse.json(row);
}
