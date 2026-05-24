'use client';

import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { Users, Calendar, FileText, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const { patients, appointments, records } = useApp();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayAppts = appointments.filter(a => a.date === today);
  const completedToday = todayAppts.filter(a => a.status === 'completed').length;
  const upcoming = appointments.filter(a => a.date >= today && a.status === 'scheduled');
  const recentPatients = [...patients].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Good morning, Dr. Hassan</h2>
          <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value={patients.length} subtitle="Active records" icon={Users} color="blue" />
          <StatCard title="Today's Appointments" value={todayAppts.length} subtitle={`${completedToday} completed`} icon={Calendar} color="green" />
          <StatCard title="Upcoming" value={upcoming.length} subtitle="Scheduled ahead" icon={Clock} color="purple" />
          <StatCard title="Medical Records" value={records.length} subtitle="Total records" icon={FileText} color="orange" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Today&apos;s Schedule</h3>
              <Link href="/appointments" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            {todayAppts.length === 0 ? (
              <p className="text-gray-400 text-sm py-6 text-center">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-3">
                {todayAppts.map(appt => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="text-center min-w-12">
                      <p className="text-sm font-bold text-gray-800">{appt.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{appt.patientName}</p>
                      <p className="text-xs text-gray-500 truncate">{appt.notes}</p>
                    </div>
                    <StatusBadge value={appt.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Recent Patients</h3>
              <Link href="/patients" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentPatients.map(patient => (
                <Link
                  key={patient.id}
                  href={`/patients/${patient.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                    {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{patient.name}</p>
                    <p className="text-xs text-gray-500">{patient.conditions.length > 0 ? patient.conditions[0] : 'No conditions recorded'}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{patient.bloodType}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Upcoming Appointments</h3>
            <Link href="/appointments/new" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
              + Schedule
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="text-gray-400 text-sm py-6 text-center">No upcoming appointments</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Patient</th>
                    <th className="pb-3 font-medium">Date &amp; Time</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {upcoming.slice(0, 5).map(appt => (
                    <tr key={appt.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{appt.patientName}</td>
                      <td className="py-3 text-gray-600">
                        {format(new Date(appt.date + 'T00:00:00'), 'MMM d, yyyy')} at {appt.time}
                      </td>
                      <td className="py-3"><StatusBadge value={appt.type} /></td>
                      <td className="py-3"><StatusBadge value={appt.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
