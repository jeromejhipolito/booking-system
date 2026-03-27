'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../stores/auth-store';
import UserMenuDropdown from './user-menu-dropdown';

const NAV_LINKS = [
  { href: '/services', label: 'Browse Services' },
  { href: '/#how-it-works', label: 'How It Works' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isHydrated, logout } = useAuth();

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const handleMobileLogout = () => {
    setMobileMenuOpen(false);
    logout();
    router.push('/login');
  };

  const customerMobileLinks = [
    { href: '/my-bookings', label: 'My Bookings' },
    { href: '/profile', label: 'Profile' },
  ];

  const providerMobileLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/onboarding', label: 'Setup' },
    { href: '/profile', label: 'Profile' },
  ];

  const mobileAuthLinks = user?.role === 'provider' ? providerMobileLinks : customerMobileLinks;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-muted-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="text-xl font-bold text-muted-900">BookIt</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-primary-600 font-bold border-b-2 border-primary-600 pb-1'
                    : 'text-muted-600 hover:text-muted-900'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isHydrated ? (
              <div className="w-24 h-8" />
            ) : isAuthenticated ? (
              <UserMenuDropdown />
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/login')
                      ? 'text-primary-600 font-bold border-b-2 border-primary-600 pb-1'
                      : 'text-muted-600 hover:text-muted-900'
                  }`}
                >
                  Login
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-muted-200 py-4 space-y-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-primary-50 text-primary-600 font-bold'
                    : 'text-muted-600 hover:bg-muted-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-muted-200 pt-3 space-y-2">
              {isHydrated && isAuthenticated ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-muted-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-500">{user?.email}</p>
                  </div>
                  {mobileAuthLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-600 hover:bg-muted-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={handleMobileLogout}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-600 hover:bg-muted-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-white bg-primary-600 text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
