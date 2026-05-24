'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Calendar, FileText, Stethoscope, Menu, X, LogOut
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/patients', icon: Users, label: 'Patients' },
  { href: '/appointments', icon: Calendar, label: 'Appointments' },
  { href: '/records', icon: FileText, label: 'Medical Records' },
];

export default function Sidebar({ onLogout }: { onLogout?: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-md border border-gray-200"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white flex flex-col z-40 transform transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="bg-blue-500 rounded-lg p-2">
            <Stethoscope size={20} />
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">Doctora</p>
            <p className="text-slate-400 text-xs">Healthcare Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
              Dr
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">Dr. Hassan</p>
              <p className="text-xs text-slate-400">General Physician</p>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
