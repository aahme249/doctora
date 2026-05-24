import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { AppProvider } from '@/lib/context';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Doctora – Healthcare Portal',
  description: 'Doctor healthcare management system',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex antialiased">
        <AuthProvider>
          <AppProvider>
            <AppShell>
              {children}
            </AppShell>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
