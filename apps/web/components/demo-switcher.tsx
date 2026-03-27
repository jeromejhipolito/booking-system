'use client';

import { useState } from 'react';
import { DEMO_MODE, DEMO_USER, DEMO_PROVIDER_USER, DEMO_TOKEN, setDemoRole } from '../lib/demo-data';
import { useAuth } from '../stores/auth-store';

export default function DemoSwitcher() {
  const { user, setAuth } = useAuth();
  const [open, setOpen] = useState(false);

  if (!DEMO_MODE) return null;

  const isProvider = user?.role === 'provider';

  const switchTo = (role: 'customer' | 'provider') => {
    setDemoRole(role);
    const demoUser = role === 'provider' ? DEMO_PROVIDER_USER : DEMO_USER;
    setAuth({ user: demoUser as any, token: DEMO_TOKEN });
    setOpen(false);
    window.location.href = role === 'provider' ? '/dashboard' : '/services';
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {open && (
        <div className="mb-2 bg-white rounded-xl shadow-2xl border border-muted-200 p-4 w-64">
          <p className="text-xs font-bold text-muted-500 uppercase tracking-wide mb-3">Demo Mode — Switch View</p>
          <button
            onClick={() => switchTo('customer')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium mb-1.5 transition-colors ${
              !isProvider ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-muted-600 hover:bg-muted-50'
            }`}
          >
            <span className="block font-semibold">Customer View</span>
            <span className="text-xs text-muted-400">Jane Doe — Browse & book services</span>
          </button>
          <button
            onClick={() => switchTo('provider')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isProvider ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-muted-600 hover:bg-muted-50'
            }`}
          >
            <span className="block font-semibold">Provider View</span>
            <span className="text-xs text-muted-400">Elena Santos — Dashboard & manage</span>
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="bg-primary-600 text-white px-4 py-2.5 rounded-full shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-all text-sm font-semibold flex items-center gap-2"
      >
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        Demo: {isProvider ? 'Provider' : 'Customer'}
      </button>
    </div>
  );
}
