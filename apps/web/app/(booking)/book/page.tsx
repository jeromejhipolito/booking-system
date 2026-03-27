'use client';

import { Suspense } from 'react';
import BookingWizard from '@/components/booking/booking-wizard';

export default function BookPage() {
  return (
    <div className="min-h-screen bg-muted-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" /></div>}>
          <BookingWizard />
        </Suspense>
      </div>
    </div>
  );
}
