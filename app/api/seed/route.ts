import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { patients, appointments, records } from '@/lib/db/schema';
import { samplePatients, sampleAppointments, sampleRecords } from '@/lib/data';

export async function POST() {
  const existingPatients = await db.select().from(patients);
  if (existingPatients.length > 0) {
    return NextResponse.json({ message: 'Database already seeded' });
  }

  await db.insert(patients).values(samplePatients);
  await db.insert(appointments).values(sampleAppointments);
  await db.insert(records).values(sampleRecords);

  return NextResponse.json({ message: 'Database seeded successfully' });
}
