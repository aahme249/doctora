'use client';

import { use } from 'react';
import { useApp } from '@/lib/context';
import Header from '@/components/Header';
import MessageThread from '@/components/MessageThread';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DoctorMessageThreadPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = use(params);
  const { patients, isLoading } = useApp();
  const patient = patients.find(p => p.id === patientId);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title={patient ? `Chat with ${patient.name}` : 'Messages'} />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col">
        <Link href="/messages" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm mb-4">
          <ArrowLeft size={16} /> Back to Messages
        </Link>

        {isLoading ? (
          <p className="text-gray-400 text-sm text-center py-10">Loading…</p>
        ) : !patient ? (
          <p className="text-gray-400 text-sm text-center py-10">Patient not found</p>
        ) : (
          <div className="flex-1 min-h-[500px]">
            <MessageThread patientId={patientId} />
          </div>
        )}
      </main>
    </div>
  );
}
