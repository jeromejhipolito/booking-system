'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_SERVICES, CATEGORIES } from '@/lib/mock-data';
import { DEMO_MODE, DEMO_SERVICES } from '@/lib/demo-data';
import { api } from '@/lib/api-client';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Beauty': 'bg-gradient-to-br from-primary-100 via-rose-50 to-pink-50',
  'Wellness': 'bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50',
  'Home Services': 'bg-gradient-to-br from-primary-100 via-primary-50 to-orange-50',
  'Fitness': 'bg-gradient-to-br from-primary-50 via-red-50 to-rose-50',
  'Consulting': 'bg-gradient-to-br from-primary-50 via-stone-100 to-warm-gray-50',
  'Pets': 'bg-gradient-to-br from-amber-50 via-primary-50 to-yellow-50',
};

const CATEGORY_ICONS: Record<string, string> = {
  'All': '✦', 'Beauty': '✂', 'Wellness': '◉', 'Home Services': '⌂',
  'Fitness': '⚡', 'Consulting': '◈', 'Pets': '🐾',
};

const CATEGORY_ACTIVE_COLORS: Record<string, string> = {
  'All': 'bg-primary-600 text-white', 'Beauty': 'bg-primary-600 text-white',
  'Wellness': 'bg-primary-600 text-white', 'Home Services': 'bg-primary-600 text-white',
  'Fitness': 'bg-primary-600 text-white', 'Consulting': 'bg-primary-600 text-white',
  'Pets': 'bg-primary-600 text-white',
};

function SkeletonCard() {
  return (
    <div className="flex bg-white rounded-xl border border-muted-200 overflow-hidden animate-pulse">
      <div className="w-[120px] h-[90px] flex-shrink-0 bg-muted-200" />
      <div className="flex-1 px-4 py-3">
        <div className="h-4 bg-muted-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted-200 rounded w-1/2 mb-3" />
        <div className="h-3 bg-muted-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recommended');
  const [isLoading, setIsLoading] = useState(true);
  const [apiServices, setApiServices] = useState<any[]>([]);

  useEffect(() => {
    async function loadServices() {
      if (DEMO_MODE) {
        setApiServices(DEMO_SERVICES);
        setIsLoading(false);
        return;
      }
      try {
        const result: any = await api.getServices();
        const data = result?.data || result || [];
        setApiServices(data.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          category: s.serviceType || 'Service',
          price: s.price || 0,
          duration: s.durationMinutes || 60,
          image: '',
          provider: {
            id: s.providerId || s.provider?.id || '',
            name: s.provider?.businessName || s.providerName || 'Provider',
            avatar: '',
            rating: 0,
            reviewCount: 0,
            address: s.provider?.address || '',
          },
          nextAvailable: '',
        })));
      } catch {
        setApiServices([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadServices();
  }, []);

  const allServices = apiServices;
  const filteredServices = allServices.filter((service: any) => {
    const matchesSearch =
      search.trim() === '' ||
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase()) ||
      service.provider.name.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.provider.rating - a.provider.rating;
      case 'reviews':
        return b.provider.reviewCount - a.provider.reviewCount;
      default:
        return b.provider.rating * b.provider.reviewCount - a.provider.rating * a.provider.reviewCount;
    }
  });

  return (
    <div className="min-h-screen bg-muted-50">
      {/* Page Header */}
      <div className="bg-white border-b border-muted-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-muted-900">Browse Services</h1>
          <p className="mt-2 text-muted-500">
            Find and book the perfect service from our top-rated providers
          </p>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search services, providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-muted-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  selectedCategory === cat
                    ? (CATEGORY_ACTIVE_COLORS[cat] || 'bg-primary-600 text-white') + ' shadow-sm scale-105'
                    : 'bg-muted-100 text-muted-600 hover:bg-muted-200'
                }`}
              >
                <span aria-hidden="true">{CATEGORY_ICONS[cat] || '✦'}</span>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sort + Count Bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-500">
            {isLoading ? 'Loading...' : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex items-center space-x-2">
            <label htmlFor="sort" className="text-sm text-muted-500">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-muted-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <svg
              className="mx-auto w-16 h-16 text-muted-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-muted-900">No services found</h3>
            <p className="mt-2 text-sm text-muted-500">
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('All');
              }}
              className="mt-4 btn-primary text-sm"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* Service List — Horizontal Cards */
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
                        {service.provider.name}
                        {service.provider.address && ` · ${service.provider.address}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-bold text-muted-900">₱{service.price.toLocaleString()}</span>
                      <p className="text-xs text-muted-400">{service.duration}min</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-500">
                      <span className="text-yellow-400">★</span>
                      <span className="font-medium text-muted-700">{service.provider.rating}</span>
                      <span>({service.provider.reviewCount} reviews)</span>
                      {service.nextAvailable && (
                        <>
                          <span className="text-muted-300">·</span>
                          <span className="text-success-600">Next: {service.nextAvailable}</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Book →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
