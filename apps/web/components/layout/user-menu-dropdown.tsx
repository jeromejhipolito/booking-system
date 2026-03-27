'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth-store';

interface MenuItem {
  label: string;
  href: string;
}

export default function UserMenuDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : '?';

  const menuItems: MenuItem[] = user?.role === 'provider'
    ? [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Setup', href: '/onboarding' },
        { label: 'Profile', href: '/profile' },
      ]
    : [
        { label: 'My Bookings', href: '/my-bookings' },
        { label: 'Profile', href: '/profile' },
      ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center space-x-2 p-1 rounded-lg hover:bg-muted-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium text-muted-700">
          {user?.firstName}
        </span>
        <svg className="w-4 h-4 text-muted-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-muted-200 py-1 z-50"
        >
          <div className="px-4 py-2 border-b border-muted-100">
            <p className="text-sm font-medium text-muted-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-500 truncate">{user?.email}</p>
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-muted-700 hover:bg-muted-50 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-muted-200 mt-1">
            <button
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
