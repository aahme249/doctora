'use client';

import { useAuth } from '@/lib/auth';
import Header from '@/components/Header';
import MessageThread from '@/components/MessageThread';

export default function PatientMessagesPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Messages" />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Message your doctor</h2>
          <p className="text-gray-500 text-sm">Send a message to Dr. Hassan's office</p>
        </div>
        {user?.patientId ? (
          <div className="flex-1 min-h-[500px]">
            <MessageThread patientId={user.patientId} />
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">No linked patient profile found.</p>
        )}
      </main>
    </div>
  );
}
