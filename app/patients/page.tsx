'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, ChevronRight, Trash2 } from 'lucide-react';
import { calculateAge } from '@/lib/utils';

export default function PatientsPage() {
  const { patients, deletePatient } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.email.toLowerCase().includes(query.toLowerCase()) ||
    p.phone.includes(query)
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Patients" />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Patients</h2>
            <p className="text-gray-500 text-sm">{patients.length} total patients</p>
          </div>
          <Link
            href="/patients/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} /> Add Patient
          </Link>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No patients found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 font-medium">Patient</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Age / Gender</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Contact</th>
                  <th className="px-5 py-3 font-medium hidden xl:table-cell">Conditions</th>
                  <th className="px-5 py-3 font-medium">Blood</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(patient => (
                  <tr key={patient.id} className="hover:bg-gray-50 group cursor-pointer" onClick={() => router.push(`/patients/${patient.id}`)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs shrink-0">
                          {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500 lg:hidden">{patient.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 hidden md:table-cell">
                      {calculateAge(patient.dateOfBirth)} yrs · {patient.gender}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 hidden lg:table-cell">{patient.phone}</td>
                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      {patient.conditions.length > 0
                        ? <span className="text-gray-700">{patient.conditions.slice(0, 2).join(', ')}{patient.conditions.length > 2 ? ` +${patient.conditions.length - 2}` : ''}</span>
                        : <span className="text-gray-400 text-xs">None recorded</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block bg-red-50 text-red-700 px-2 py-0.5 rounded text-xs font-medium">{patient.bloodType}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm(`Delete ${patient.name}?`)) deletePatient(patient.id);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                        <Link href={`/patients/${patient.id}`} onClick={e => e.stopPropagation()} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                          <ChevronRight size={14} />
                        </Link>
                      </div>
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
