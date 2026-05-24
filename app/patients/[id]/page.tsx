'use client';

import { use } from 'react';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { calculateAge } from '@/lib/utils';

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { patients, appointments, records } = useApp();
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return (
      <div className="flex flex-col flex-1">
        <Header title="Patient Not Found" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Patient not found</p>
            <Link href="/patients" className="text-blue-600 hover:underline">Back to patients</Link>
          </div>
        </div>
      </div>
    );
  }

  const patientAppts = appointments.filter(a => a.patientId === id).sort((a, b) => b.date.localeCompare(a.date));
  const patientRecords = records.filter(r => r.patientId === id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={patient.name} />
      <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        <Link href="/patients" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
          <ArrowLeft size={16} /> Back to Patients
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0">
              {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-500 text-sm">{calculateAge(patient.dateOfBirth)} years old · {patient.gender}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Phone size={14} />{patient.phone}</span>
                <span className="flex items-center gap-1.5"><Mail size={14} />{patient.email}</span>
                <span className="flex items-center gap-1.5"><MapPin size={14} />{patient.address}</span>
              </div>
            </div>
            <span className="bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded-lg text-sm shrink-0">{patient.bloodType}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Allergies</p>
              {patient.allergies.length === 0
                ? <span className="text-sm text-gray-400">No known allergies</span>
                : <div className="flex flex-wrap gap-2">
                    {patient.allergies.map(a => (
                      <span key={a} className="bg-red-50 text-red-700 text-xs px-2.5 py-1 rounded-full">{a}</span>
                    ))}
                  </div>}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Conditions</p>
              {patient.conditions.length === 0
                ? <span className="text-sm text-gray-400">No conditions recorded</span>
                : <div className="flex flex-wrap gap-2">
                    {patient.conditions.map(c => (
                      <span key={c} className="bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Calendar size={16} />Appointments</h3>
              <Link href={`/appointments/new?patient=${id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Schedule
              </Link>
            </div>
            {patientAppts.length === 0
              ? <p className="text-sm text-gray-400 py-4 text-center">No appointments</p>
              : <div className="space-y-3">
                  {patientAppts.slice(0, 5).map(appt => (
                    <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{format(new Date(appt.date + 'T00:00:00'), 'MMM d, yyyy')} · {appt.time}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{appt.notes}</p>
                      </div>
                      <StatusBadge value={appt.status} />
                    </div>
                  ))}
                </div>}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FileText size={16} />Medical Records</h3>
              <Link href={`/records/new?patient=${id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <Plus size={12} /> Add Record
              </Link>
            </div>
            {patientRecords.length === 0
              ? <p className="text-sm text-gray-400 py-4 text-center">No medical records</p>
              : <div className="space-y-3">
                  {patientRecords.slice(0, 5).map(rec => (
                    <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">{rec.diagnosis}</p>
                        <p className="text-xs text-gray-400">{format(new Date(rec.date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{rec.treatment}</p>
                    </div>
                  ))}
                </div>}
          </div>
        </div>
      </main>
    </div>
  );
}
