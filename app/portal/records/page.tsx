'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PatientRecordsPage() {
  const { user } = useAuth();
  const { records, patients } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const patientRecord = patients.find(
    p => p.email.toLowerCase() === user?.email?.toLowerCase()
  );

  const myRecords = records.filter(r =>
    patientRecord ? r.patientId === patientRecord.id : r.patientName === user?.name
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="My Records" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">My Medical Records</h2>
          <p className="text-gray-500 text-sm">{myRecords.length} records on file</p>
        </div>

        {myRecords.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No medical records yet</p>
            <p className="text-sm text-gray-400 mt-1">Records added by your doctor will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRecords.map(record => (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                >
                  <div>
                    <p className="font-semibold text-gray-900">{record.diagnosis}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {format(new Date(record.date + 'T00:00:00'), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  {expanded === record.id
                    ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                    : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                </div>

                {expanded === record.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Symptoms', value: record.symptoms },
                      { label: 'Diagnosis', value: record.diagnosis },
                      { label: 'Treatment', value: record.treatment },
                      { label: 'Medications', value: record.medications },
                      { label: 'Doctor\'s Notes', value: record.notes },
                      { label: 'Follow-up Date', value: record.followUp ? format(new Date(record.followUp + 'T00:00:00'), 'MMMM d, yyyy') : '—' },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                        <p className="text-sm text-gray-800">{value || '—'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
