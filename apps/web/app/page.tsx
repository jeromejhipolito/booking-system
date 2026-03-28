'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DEMO_MODE, DEMO_SERVICES } from '@/lib/demo-data';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Beauty': 'bg-gradient-to-br from-primary-100 via-rose-50 to-pink-50',
  'Wellness': 'bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50',
  'Home Services': 'bg-gradient-to-br from-primary-100 via-primary-50 to-orange-50',
  'Fitness': 'bg-gradient-to-br from-primary-50 via-red-50 to-rose-50',
  'Consulting': 'bg-gradient-to-br from-primary-50 via-stone-100 to-warm-gray-50',
  'Pets': 'bg-gradient-to-br from-amber-50 via-primary-50 to-yellow-50',
};

const CATEGORY_ICONS: Record<string, string> = {
  'All': '✦',
  'Beauty': '✂',
  'Wellness': '◉',
  'Home Services': '⌂',
  'Fitness': '⚡',
  'Consulting': '◈',
  'Pets': '🐾',
};

const CATEGORIES = ['All', 'Beauty', 'Wellness', 'Home Services', 'Fitness', 'Consulting', 'Pets'];

export default function HomePage() {
  const allServices = DEMO_MODE ? DEMO_SERVICES : [];
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredServices = allServices.filter((service) => {
    const matchesSearch =
      search.trim() === '' ||
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.provider.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-muted-50">
      {/* Two-panel layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 pt-6 pb-12">

          {/* Left Rail */}
          <aside className="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto pb-6 lg:pb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-muted-900 leading-tight">
              Book beauty &amp; wellness services in{' '}
              <span className="text-primary-600">Metro Manila</span>
            </h1>
            <p className="mt-3 text-sm text-muted-500 leading-relaxed">
              From balayage to hilot massage, find the perfect appointment in seconds.
            </p>

            {/* Search */}
            <div className="mt-5 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-muted-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm bg-white"
              />
            </div>

            {/* Category list */}
            <nav className="mt-5 space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-muted-600 hover:bg-muted-100 hover:text-muted-900'
                  }`}
                >
                  <span className="mr-2">{CATEGORY_ICONS[cat]}</span>
                  {cat}
                </button>
              ))}
            </nav>

            {/* CTA */}
            <div className="mt-6 hidden lg:block">
              <Link
                href="/register"
                className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2 px-4 rounded-lg border border-primary-200 hover:bg-primary-50 transition-colors"
              >
                List Your Business
              </Link>
            </div>
          </aside>

          {/* Right Column — Service Feed */}
          <main>
            {/* Category horizontal strip (mobile supplement) */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 lg:hidden">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-600 text-white'
                      : 'bg-muted-200 text-muted-600'
                  }`}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>

            <p className="text-sm text-muted-500 mb-4">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
            </p>

            {/* Service feed — horizontal cards */}
            <div className="space-y-3">
              {filteredServices.map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="flex bg-white rounded-xl border border-muted-200 overflow-hidden hover:border-l-4 hover:border-l-primary-500 transition-all group"
                >
                  {/* Gradient thumbnail */}
                  <div className={`w-[120px] h-[90px] flex-shrink-0 ${CATEGORY_GRADIENTS[service.category] || 'bg-gradient-to-br from-muted-200 to-muted-300'} flex items-center justify-center`}>
                    <span className="text-2xl opacity-60">{CATEGORY_ICONS[service.category] || '✦'}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 px-4 py-3 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-muted-900 group-hover:text-primary-600 transition-colors truncate">
                          {service.name}
                        </h3>
                        <p className="text-xs text-muted-500 truncate">
                          {service.provider.name} · {service.provider.address}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-muted-900 whitespace-nowrap">
                        ₱{service.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-500">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium text-muted-700">{service.provider.rating}</span>
                        <span>({service.provider.reviewCount})</span>
                        <span className="text-muted-300">·</span>
                        <span>{service.duration}min</span>
                      </div>
                      <span className="text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Book →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-500 font-medium">No services found</p>
                <p className="text-sm text-muted-400 mt-1">Try a different search or category</p>
                <button
                  onClick={() => { setSearch(''); setSelectedCategory('All'); }}
                  className="mt-4 text-sm text-primary-600 font-medium hover:text-primary-700"
                >
                  Clear filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-muted-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-sm text-muted-500 hover:text-muted-700">Browse Services</Link></li>
                <li><Link href="/register" className="text-sm text-muted-500 hover:text-muted-700">For Providers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-500">About Us</span></li>
                <li><span className="text-sm text-muted-500">Careers</span></li>
                <li><span className="text-sm text-muted-500">Blog</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-500">Help Center</span></li>
                <li><span className="text-sm text-muted-500">Contact</span></li>
                <li><span className="text-sm text-muted-500">Privacy Policy</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-900 mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-muted-500">Twitter</span></li>
                <li><span className="text-sm text-muted-500">LinkedIn</span></li>
                <li><span className="text-sm text-muted-500">Instagram</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-muted-200 text-center">
            <p className="text-sm text-muted-400">&copy; 2026 BookIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
