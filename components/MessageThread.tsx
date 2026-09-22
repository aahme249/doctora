'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { Message } from '@/lib/types';
import { useAuth } from '@/lib/auth';
import { Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const POLL_INTERVAL_MS = 7000;

export default function MessageThread({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const data = await apiFetch<Message[]>(`/api/messages/${patientId}`);
      setMessages(data);
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load messages.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const sent = await apiFetch<Message>('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ patientId, body: trimmed }),
      });
      setMessages(prev => [...prev, sent]);
      setBody('');
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-10">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No messages yet — say hello!</p>
        ) : (
          messages.map(m => {
            const mine = m.senderRole === user?.role;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-blue-100' : 'text-gray-400'}`}>
                    {format(new Date(m.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border-t border-red-100 px-4 py-2 text-xs">
          <AlertCircle size={13} className="shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-gray-100">
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send size={14} /> Send
        </button>
      </form>
    </div>
  );
}
