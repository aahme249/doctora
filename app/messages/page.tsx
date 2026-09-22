'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { apiFetch } from '@/lib/apiClient';
import Header from '@/components/Header';
import Link from 'next/link';
import { Search, MessageCircle, ChevronRight } from 'lucide-react';

interface UnreadByPatient {
  patientId: string;
  count: number;
}

export default function MessagesListPage() {
  const { patients, isLoading } = useApp();
  const [query, setQuery] = useState('');
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  useEffect(() => {
    apiFetch<UnreadByPatient[]>('/api/messages/unread-by-patient')
      .then(rows => setUnreadMap(Object.fromEntries(rows.map(r => [r.patientId, r.count]))))
      .catch(() => {});
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Messages" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <p className="text-gray-500 text-sm">Select a patient to view or start a conversation</p>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg w-full sm:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <p className="text-gray-400 text-sm py-10 text-center">Loading patients…</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No patients found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filtered.map(p => (
              <Link
                key={p.id}
                href={`/messages/${p.id}`}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm shrink-0">
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500 truncate">{p.email}</p>
                </div>
                {unreadMap[p.id] > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {unreadMap[p.id] > 9 ? '9+' : unreadMap[p.id]}
                  </span>
                )}
                <MessageCircle size={16} className="text-gray-300" />
                <ChevronRight size={16} className="text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
