'use client';

import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';

export default function PatientAppointmentsPage() {
  const { user } = useAuth();
  const { appointments, patients } = useApp();

  const patientRecord = patients.find(
    p => p.email.toLowerCase() === user?.email?.toLowerCase()
  );

  const myAppts = appointments.filter(a =>
    patientRecord ? a.patientId === patientRecord.id : a.patientName === user?.name
  ).sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="My Appointments" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Appointments</h2>
          <p className="text-gray-500 text-sm">{myAppts.length} total</p>
        </div>

        {myAppts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No appointments on record</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAppts.map(appt => (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">
                        {format(new Date(appt.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <span className="text-gray-400">·</span>
                      <p className="text-gray-600">{appt.time}</p>
                    </div>
                    {appt.notes && <p className="text-sm text-gray-500">{appt.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge value={appt.status} />
                    <StatusBadge value={appt.type} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
