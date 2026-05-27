'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import StatusBadge from '@/components/StatusBadge';
import { Bot, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { AppointmentRequest, RequestStatus } from '@/lib/types';
import { sendEmail } from '@/lib/sendEmail';

type FilterTab = 'pending' | 'approved' | 'rejected' | 'all';

export default function RequestsPage() {
  const { appointmentRequests, updateAppointmentRequest, addAppointment, patients, deleteAppointmentRequest } = useApp();
  const [tab, setTab] = useState<FilterTab>('pending');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const filtered = appointmentRequests
    .filter(r => tab === 'all' || r.status === tab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const pendingCount = appointmentRequests.filter(r => r.status === 'pending').length;

  function toggleExpand(id: string) {
    setExpanded(prev => prev === id ? null : id);
  }

  async function handleDecision(request: AppointmentRequest, decision: 'approved' | 'rejected') {
    const notes = reviewNotes[request.id] ?? '';
    const now = new Date().toISOString();

    updateAppointmentRequest(request.id, {
      status: decision as RequestStatus,
      reviewNotes: notes,
      reviewedAt: now,
    });

    if (decision === 'approved') {
      addAppointment({
        patientId: request.patientId,
        patientName: request.patientName,
        date: request.preferredDate,
        time: request.preferredTime,
        type: request.type,
        status: 'scheduled',
        notes: request.agentAnalysis?.appointmentNotes
          ? `${request.reason} — ${request.agentAnalysis.appointmentNotes}`
          : request.reason,
      });
    }

    const patient = patients.find(p => p.id === request.patientId);
    const email = patient?.email;
    if (email) {
      sendEmail(email, {
        type: 'request_decision',
        data: {
          name: request.patientName,
          type: request.type,
          preferredDate: format(new Date(request.preferredDate + 'T00:00:00'), 'MMMM d, yyyy'),
          decision,
          notes: notes || undefined,
        },
      });
    }

    setExpanded(null);
  }

  const urgencyColor: Record<string, string> = {
    urgent: 'bg-red-50 text-red-700 border-red-200',
    normal: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Appointment Requests" />
      <main className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Appointment Requests</h2>
            <p className="text-gray-500 text-sm">{appointmentRequests.length} total · {pendingCount} pending review</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <Bot size={16} className="text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">AI-analysed requests</span>
          </div>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-5 w-fit">
          {(['pending', 'approved', 'rejected', 'all'] as FilterTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors relative
                ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
            >
              {t}
              {t === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400">No {tab === 'all' ? '' : tab} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpand(req.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-gray-900">{req.patientName}</p>
                        <StatusBadge value={req.type} />
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${urgencyColor[req.urgency]}`}>
                          {req.urgency}
                        </span>
                        {req.status !== 'pending' && <StatusBadge value={req.status} />}
                      </div>
                      <p className="text-sm text-gray-500">
                        Requested {format(new Date(req.preferredDate + 'T00:00:00'), 'MMM d, yyyy')} at {req.preferredTime}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{req.reason}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.agentStatus === 'running' && <Loader2 size={14} className="text-blue-500 animate-spin" />}
                      {req.agentStatus === 'done' && <Bot size={14} className="text-blue-500" />}
                      <p className="text-xs text-gray-400">{format(new Date(req.createdAt), 'MMM d')}</p>
                      {expanded === req.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                </div>

                {expanded === req.id && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reason</p>
                      <p className="text-sm text-gray-700">{req.reason}</p>
                    </div>

                    {req.agentAnalysis && (
                      <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot size={15} className="text-blue-600" />
                          <p className="text-sm font-semibold text-blue-800">AI Agent Analysis</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs font-medium text-blue-700 mb-1">Intake Agent</p>
                            <p className="text-xs text-blue-900">{req.agentAnalysis.intakeNotes}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-700 mb-1">Scheduling Agent</p>
                            <p className="text-xs text-blue-900">{req.agentAnalysis.schedulingSuggestion}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-blue-700 mb-1">Triage Agent</p>
                            <p className="text-xs text-blue-900">{req.agentAnalysis.triagePriority}</p>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-blue-200">
                          <p className="text-xs font-medium text-blue-700 mb-1">Supervisor Summary</p>
                          <p className="text-xs text-blue-900">{req.agentAnalysis.supervisorSummary}</p>
                        </div>
                      </div>
                    )}

                    {req.agentStatus === 'running' && (
                      <div className="bg-blue-50 rounded-lg p-4 flex items-center gap-3">
                        <Loader2 size={16} className="text-blue-500 animate-spin shrink-0" />
                        <p className="text-sm text-blue-700">AI agents are analysing this request...</p>
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Review notes (optional)</label>
                          <textarea
                            value={reviewNotes[req.id] ?? ''}
                            onChange={e => setReviewNotes(prev => ({ ...prev, [req.id]: e.target.value }))}
                            rows={2}
                            placeholder="Add notes for the patient..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDecision(req, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            <XCircle size={15} /> Decline
                          </button>
                          <button
                            onClick={() => handleDecision(req, 'approved')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle size={15} /> Approve & Schedule
                          </button>
                        </div>
                      </div>
                    )}

                    {req.status !== 'pending' && (
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-gray-500">
                          {req.status === 'approved' ? 'Approved' : 'Declined'}
                          {req.reviewedAt ? ` on ${format(new Date(req.reviewedAt), 'MMM d, yyyy')}` : ''}
                        </span>
                        {req.reviewNotes && <span className="text-gray-400">· {req.reviewNotes}</span>}
                      </div>
                    )}
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
