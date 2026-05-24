'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { sendEmail } from '@/lib/sendEmail';
import { AppointmentStatus } from '@/lib/types';

const STATUS_OPTIONS = ['all', 'scheduled', 'completed', 'cancelled', 'no-show'];

export default function AppointmentsPage() {
  const { appointments, updateAppointment, deleteAppointment, patients } = useApp();

  async function handleStatusChange(apptId: string, newStatus: AppointmentStatus) {
    const appt = appointments.find(a => a.id === apptId);
    if (!appt) return;
    updateAppointment(apptId, { status: newStatus });
    const patient = patients.find(p => p.id === appt.patientId);
    if (patient?.email && newStatus !== 'scheduled') {
      sendEmail(patient.email, {
        type: 'appointment_status',
        data: {
          name: appt.patientName,
          date: format(new Date(appt.date + 'T00:00:00'), 'MMMM d, yyyy'),
          time: appt.time,
          status: newStatus,
        },
      });
    }
  }
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = appointments.filter(a => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchStatus && matchDate;
  }).sort((a, b) => {
    const dateComp = b.date.localeCompare(a.date);
    return dateComp !== 0 ? dateComp : a.time.localeCompare(b.time);
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Appointments" />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Appointments</h2>
            <p className="text-gray-500 text-sm">{appointments.length} total</p>
          </div>
          <Link
            href="/appointments/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Schedule
          </Link>
        </div>

        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {STATUS_OPTIONS.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
                  ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-xs text-gray-500 hover:text-gray-700 underline">
              Clear date
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No appointments found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium">Date &amp; Time</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Notes</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(appt => (
                  <tr key={appt.id} className="hover:bg-gray-50 group">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{appt.patientName}</td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <p>{format(new Date(appt.date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-gray-400">{appt.time}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell"><StatusBadge value={appt.type} /></td>
                    <td className="px-5 py-3.5">
                      <select
                        value={appt.status}
                        onChange={e => handleStatusChange(appt.id, e.target.value as AppointmentStatus)}
                        className="text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No-show</option>
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden lg:table-cell max-w-xs truncate">{appt.notes || '—'}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => { if (confirm('Delete appointment?')) deleteAppointment(appt.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
