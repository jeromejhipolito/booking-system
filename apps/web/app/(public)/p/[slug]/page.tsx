'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { DEMO_MODE, DEMO_SERVICES, DEMO_REVIEWS } from '@/lib/demo-data';
import SlotGrid from '@/components/booking/slot-grid';
import type { ApiSlot } from '@/hooks/use-availability';

export default function ProviderProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [copied, setCopied] = useState(false);

  // Find provider by slug in demo data
  const providerServices = DEMO_MODE
    ? DEMO_SERVICES.filter((s) => s.provider.slug === slug)
    : [];

  const provider = providerServices[0]?.provider;

  if (!provider) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-muted-900 mb-2">Provider Not Found</h1>
        <p className="text-muted-500 mb-6">This provider page doesn&apos;t exist.</p>
        <Link href="/services" className="text-primary-600 font-medium hover:text-primary-700">
          Browse all services
        </Link>
      </main>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlotSelect = (slot: ApiSlot, date: string) => {
    // Navigate to the first service of this provider with the slot pre-selected
    const firstService = providerServices[0];
    if (firstService) {
      window.location.href = `/services/${firstService.id}#book`;
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Provider header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {provider.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-muted-900">{provider.name}</h1>
            <p className="text-sm text-muted-500">{provider.address}</p>
            <div className="flex items-center gap-1.5 mt-1 text-sm">
              <span className="text-yellow-400">★</span>
              <span className="font-medium text-muted-700">{provider.rating}</span>
              <span className="text-muted-400">({provider.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 border border-muted-200 rounded-lg text-sm font-medium text-muted-700 hover:bg-muted-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* Services */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-muted-900 mb-4">Services</h2>
        <div className="space-y-3">
          {providerServices.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.id}`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-muted-200 hover:border-primary-300 transition-colors group"
            >
              <div>
                <h3 className="text-sm font-semibold text-muted-900 group-hover:text-primary-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-xs text-muted-500 mt-0.5">{service.duration} min</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-muted-900">₱{service.price.toLocaleString()}</span>
                <p className="text-xs text-primary-600 font-medium mt-0.5">Book →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Slot Grid */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-muted-900 mb-4">Availability</h2>
        <div className="bg-white rounded-xl border border-muted-200 p-4">
          <SlotGrid providerId={provider.id} onSlotSelect={handleSlotSelect} />
        </div>
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-lg font-semibold text-muted-900 mb-4">Reviews</h2>
        <div className="space-y-4">
          {DEMO_REVIEWS.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-muted-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-900">{review.reviewerName}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-xs ${i < review.rating ? 'text-yellow-400' : 'text-muted-200'}`}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
