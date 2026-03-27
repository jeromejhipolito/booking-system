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
    <div className="card p-6 animate-pulse">
      <div className="h-4 bg-muted-200 rounded w-20 mb-3" />
      <div className="h-5 bg-muted-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted-200 rounded w-full mb-1" />
      <div className="h-4 bg-muted-200 rounded w-2/3 mb-4" />
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-muted-200 rounded-full" />
        <div>
          <div className="h-4 bg-muted-200 rounded w-24 mb-1" />
          <div className="h-3 bg-muted-200 rounded w-16" />
        </div>
      </div>
      <div className="pt-4 border-t border-muted-100 flex justify-between">
        <div className="h-5 bg-muted-200 rounded w-16" />
        <div className="h-5 bg-muted-200 rounded w-20" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          /* Service Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="card-interactive overflow-hidden group flex flex-col"
              >
                {/* Image placeholder */}
                <Link href={`/services/${service.id}`} className="block">
                  <div className={`relative h-40 ${CATEGORY_GRADIENTS[service.category] || 'bg-gradient-to-br from-muted-200 to-muted-300'}`}>
                    {service.image && <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover" onError={(e: any) => { e.target.style.display = 'none'; }} />}
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-white/90 backdrop-blur-sm text-muted-700 rounded-full shadow-sm">
                        {CATEGORY_ICONS[service.category] || '✦'} {service.category}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Next: {service.nextAvailable}
                    </div>
                  </div>
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <Link href={`/services/${service.id}`}>
                    <h3 className="text-lg font-semibold text-muted-900 group-hover:text-primary-600 transition-colors leading-snug">
                      {service.name}
                    </h3>
                  </Link>
                  <p className="mt-1.5 text-sm text-muted-500 line-clamp-2 leading-relaxed flex-1">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                      {service.provider.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-900 truncate">{service.provider.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-500">
                        <span className="text-yellow-400">★</span>
                        <span className="font-medium text-muted-700">{service.provider.rating}</span>
                        <span>({service.provider.reviewCount})</span>
                        {service.provider.address && (
                          <>
                            <span className="text-muted-300">·</span>
                            <span className="truncate">{service.provider.address}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-muted-100">
                    <div>
                      <span className="text-xl font-bold text-muted-900">
                        ${service.price}
                      </span>
                      <span className="text-sm text-muted-400">
                        {' '}
                        / {service.duration}min
                      </span>
                    </div>
                    <Link
                      href={`/book?serviceId=${service.id}`}
                      className="btn-primary text-sm !py-2 !px-4 shadow-sm shadow-primary-600/20 hover:shadow-md hover:-translate-y-px transition-all duration-150"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
