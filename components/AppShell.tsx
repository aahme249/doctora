'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import PatientSidebar from './PatientSidebar';

const PUBLIC_PATHS = ['/login', '/register'];
// /register handles its own post-auth redirect (shows success screen first)
const REDIRECT_EXCLUDED = ['/register'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && isPublic && !REDIRECT_EXCLUDED.includes(pathname)) {
      router.replace(user?.role === 'patient' ? '/portal' : '/');
      return;
    }
    // Patients must stay within /portal (but not on /register which handles its own redirect)
    if (isAuthenticated && user?.role === 'patient' && !pathname.startsWith('/portal') && !REDIRECT_EXCLUDED.includes(pathname)) {
      router.replace('/portal');
      return;
    }
    // Doctors must stay outside /portal
    if (isAuthenticated && user?.role === 'doctor' && pathname.startsWith('/portal')) {
      router.replace('/');
    }
  }, [isAuthenticated, isPublic, pathname, router, user]);

  if (isPublic) return <>{children}</>;
  if (!isAuthenticated) return null;

  if (user?.role === 'patient') {
    return (
      <>
        <PatientSidebar onLogout={logout} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
      </>
    );
  }

  return (
    <>
      <Sidebar onLogout={logout} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">{children}</div>
    </>
  );
}
