'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_SERVICES } from '../../../../lib/mock-data';
import { DEMO_MODE, DEMO_SERVICES } from '../../../../lib/demo-data';
import { api } from '../../../../lib/api-client';
import ReviewsSection from '../../../../components/review/reviews-section';

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    async function loadService() {
      if (DEMO_MODE) {
        const found = DEMO_SERVICES.find((s) => s.id === serviceId);
        setService(found || null);
        setIsLoading(false);
        return;
      }
      try {
        const result: any = await api.get(`/services/${serviceId}`);
        if (result) {
          setService({
            id: result.id,
            name: result.name,
            description: result.description || '',
            category: result.serviceType || 'Service',
            price: result.price || 0,
            duration: result.durationMinutes || 60,
            image: '',
            color: 'bg-primary-100 text-primary-700',
            initials: (result.provider?.businessName || result.name || 'S').charAt(0),
            providerName: result.provider?.businessName || 'Provider',
            nextAvailable: 'Check availability',
            provider: {
              id: result.providerId || result.provider?.id || '',
              name: result.provider?.businessName || 'Provider',
              address: result.provider?.address || '',
              rating: 0,
              reviewCount: 0,
            },
          });
        }
      } catch {
        setService(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadService();
  }, [serviceId]);

  if (isLoading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded-xl" />
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
        <p className="text-gray-500 mb-6">This service doesn't exist or has been removed.</p>
        <Link href="/services" className="text-blue-600 font-medium hover:text-blue-700">
          Browse all services
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-500 hover:text-muted-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to services
      </Link>

      <div className="bg-white rounded-2xl border border-muted-200 shadow-sm overflow-hidden">
        {/* Service header banner */}
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 px-6 sm:px-8 pt-8 pb-10">
          {service.image && <img src={service.image} alt={service.name} className="absolute inset-0 w-full h-full object-cover opacity-30" />}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-primary-800/40" />
          <div className="relative flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 shadow-lg border-2 border-white/20 ${service.color}`}>
              {service.initials}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-500/20 text-accent-200 border border-accent-500/30">
                  New Provider
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white leading-tight">{service.name}</h1>
              <p className="text-primary-200 text-sm mt-0.5">{service.providerName}</p>
            </div>
          </div>
        </div>

        {/* Metrics strip — overlaps banner with negative margin */}
        <div className="mx-6 sm:mx-8 -mt-5 grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white rounded-xl border border-muted-200 shadow-sm px-4 py-3 text-center">
            <p className="text-xs text-muted-500 font-medium uppercase tracking-wide">Price</p>
            <p className="text-2xl font-bold text-muted-900 mt-0.5">${service.price}</p>
          </div>
          <div className="bg-white rounded-xl border border-muted-200 shadow-sm px-4 py-3 text-center">
            <p className="text-xs text-muted-500 font-medium uppercase tracking-wide">Duration</p>
            <p className="text-2xl font-bold text-muted-900 mt-0.5">{service.duration} min</p>
          </div>
        </div>

        <div className="px-6 sm:px-8 pt-5 pb-6 sm:pb-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-success-600">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            Next available: {service.nextAvailable}
          </div>

          {service.provider?.address && (
            <div className="flex items-center gap-1.5 text-sm text-muted-500">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate" title={service.provider.address}>{service.provider.address}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/book?service=${service.id}`}
              className="flex-1 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-xl text-center hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md shadow-primary-600/25 hover:shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5"
            >
              Book Now
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied!');
              }}
              className="py-3.5 px-6 border border-muted-200 rounded-xl font-medium text-muted-700 hover:bg-muted-50 hover:border-muted-300 transition-all duration-200"
            >
              Share Link
            </button>
          </div>

          <ReviewsSection serviceId={serviceId} />
        </div>
      </div>
    </main>
  );
}
