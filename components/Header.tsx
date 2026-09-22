'use client';

import { Bell, Search } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth';
import { apiFetch } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL_MS = 15000;

export default function Header({ title }: { title: string }) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { patients } = useApp();
  const { user } = useAuth();
  const router = useRouter();

  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnread = useCallback(() => {
    apiFetch<{ count: number }>('/api/messages/unread-count')
      .then(res => setUnreadCount(res.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  function goToMessages() {
    router.push(user?.role === 'doctor' ? '/messages' : '/portal/messages');
  }

  const results = query.length > 1
    ? patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-lg font-semibold text-gray-800 hidden sm:block">{title}</h1>

      <div className="relative ml-auto mr-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search patients..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowResults(true); }}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {showResults && results.length > 0 && (
          <div className="absolute top-full mt-1 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {results.map(p => (
              <button
                key={p.id}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm"
                onMouseDown={() => { router.push(`/patients/${p.id}`); setQuery(''); }}
              >
                <p className="font-medium text-gray-800">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.phone}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <button onClick={goToMessages} className="relative p-2 rounded-lg hover:bg-gray-100">
        <Bell size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </header>
  );
}
