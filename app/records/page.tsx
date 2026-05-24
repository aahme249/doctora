'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import Link from 'next/link';
import { Plus, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function RecordsPage() {
  const { records, deleteRecord } = useApp();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = records.filter(r =>
    r.patientName.toLowerCase().includes(query.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(query.toLowerCase())
  ).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Medical Records" />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
            <p className="text-gray-500 text-sm">{records.length} total records</p>
          </div>
          <Link
            href="/records/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Add Record
          </Link>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient or diagnosis..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No medical records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(record => (
              <div key={record.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === record.id ? null : record.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-sm shrink-0">
                      {record.patientName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900">{record.patientName}</p>
                      <p className="text-sm text-gray-600 truncate">{record.diagnosis}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-sm text-gray-400 hidden sm:block">
                      {format(new Date(record.date + 'T00:00:00'), 'MMM d, yyyy')}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); if (confirm('Delete record?')) deleteRecord(record.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                    {expanded === record.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </div>
                </div>

                {expanded === record.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Symptoms', value: record.symptoms },
                      { label: 'Diagnosis', value: record.diagnosis },
                      { label: 'Treatment', value: record.treatment },
                      { label: 'Medications', value: record.medications },
                      { label: 'Notes', value: record.notes },
                      { label: 'Follow-up', value: record.followUp ? format(new Date(record.followUp + 'T00:00:00'), 'MMMM d, yyyy') : '—' },
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
