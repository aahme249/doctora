'use client';

import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import StatCard from '@/components/StatCard';
import { Calendar, FileText, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function PatientPortalPage() {
  const { user } = useAuth();
  const { appointments, records, patients } = useApp();

  const patientRecord = patients.find(
    p => p.email.toLowerCase() === user?.email?.toLowerCase()
  );

  const today = format(new Date(), 'yyyy-MM-dd');
  const myAppts = appointments.filter(a =>
    patientRecord ? a.patientId === patientRecord.id : a.patientName === user?.name
  ).sort((a, b) => b.date.localeCompare(a.date));

  const myRecords = records.filter(r =>
    patientRecord ? r.patientId === patientRecord.id : r.patientName === user?.name
  ).sort((a, b) => b.date.localeCompare(a.date));

  const upcoming = myAppts.filter(a => a.date >= today && a.status === 'scheduled');
  const past = myAppts.filter(a => a.date < today || a.status === 'completed');

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="My Portal" />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]}</h2>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Upcoming Appointments" value={upcoming.length} icon={Calendar} color="blue" />
          <StatCard title="Past Appointments" value={past.length} icon={Clock} color="green" />
          <StatCard title="Medical Records" value={myRecords.length} icon={FileText} color="purple" />
        </div>

        {patientRecord && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">My Health Profile</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Blood Type</p>
                <span className="bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-lg text-sm">{patientRecord.bloodType}</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                <p className="font-medium text-gray-800">{patientRecord.gender}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Allergies</p>
                <p className="text-gray-800">{patientRecord.allergies.length > 0 ? patientRecord.allergies.join(', ') : 'None known'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Conditions</p>
                <p className="text-gray-800">{patientRecord.conditions.length > 0 ? patientRecord.conditions[0] : 'None recorded'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
              <Link href="/portal/appointments" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {upcoming.length === 0
              ? <p className="text-sm text-gray-400 py-6 text-center">No upcoming appointments</p>
              : <div className="space-y-3">
                  {upcoming.slice(0, 4).map(appt => (
                    <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {format(new Date(appt.date + 'T00:00:00'), 'MMM d, yyyy')} · {appt.time}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{appt.notes || appt.type}</p>
                      </div>
                      <StatusBadge value={appt.type} />
                    </div>
                  ))}
                </div>
            }
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Recent Records</h3>
              <Link href="/portal/records" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {myRecords.length === 0
              ? <p className="text-sm text-gray-400 py-6 text-center">No medical records yet</p>
              : <div className="space-y-3">
                  {myRecords.slice(0, 4).map(rec => (
                    <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{rec.diagnosis}</p>
                        <p className="text-xs text-gray-400">{format(new Date(rec.date + 'T00:00:00'), 'MMM d')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{rec.treatment}</p>
                    </div>
                  ))}
                </div>
            }
          </div>
        </div>
      </main>
    </div>
  );
}
