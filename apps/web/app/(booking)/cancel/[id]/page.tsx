'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface BookingDetails {
  id: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  service?: { name: string; price: string; durationMinutes: number };
  provider?: { businessName: string };
  customer?: { email: string; firstName: string; lastName: string };
}

export default function CancelBookingPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : '';
        const data = await apiClient<BookingDetails>(
          `/bookings/${params.id}${tokenQuery}`,
          { skipAuth: !!token },
        );
        setBooking(data);

        if (data.status === 'cancelled') {
          setIsCancelled(true);
        }
      } catch (err: any) {
        console.warn('Failed to fetch booking:', err.message);
        setError(err.message || 'Could not load booking details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBooking();
  }, [params.id, token]);

  const handleCancel = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const body: any = { reason: 'Cancelled by customer' };
      if (token) {
        body.token = token;
      }
      await apiClient(`/bookings/${params.id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify(body),
        skipAuth: !!token,
      });
      setIsCancelled(true);
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format ISO date
  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
    } catch {
      return iso;
    }
  };
  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
    } catch {
      return iso;
    }
  };

  const serviceName = booking?.service?.name || 'Service';
  const providerName = booking?.provider?.businessName || 'Provider';
  const customerEmail = booking?.customer?.email || '';
  const dateStr = booking ? formatDate(booking.startTime) : '';
  const startTimeStr = booking ? formatTime(booking.startTime) : '';
  const endTimeStr = booking ? formatTime(booking.endTime) : '';
  const price = booking?.service?.price || '0';

  if (isCancelled) {
    return (
      <div className="min-h-screen bg-muted-50 flex items-center justify-center px-4 py-12">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-muted-900">Booking Cancelled</h1>
          <p className="mt-2 text-muted-500">
            Your appointment for {serviceName} on {dateStr} has been cancelled.
          </p>
          {customerEmail && (
            <p className="mt-2 text-sm text-muted-400">A confirmation email will be sent to {customerEmail}.</p>
          )}
          <Link href="/" className="mt-6 btn-primary inline-block text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted-50 py-8">
        <div className="max-w-lg mx-auto px-4">
          <div className="card p-8 animate-pulse">
            <div className="h-6 bg-muted-200 rounded w-48 mb-4" />
            <div className="h-4 bg-muted-200 rounded w-64 mb-8" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-muted-50 flex items-center justify-center px-4 py-12">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-danger-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-muted-900">Could Not Load Booking</h1>
          <p className="mt-2 text-sm text-muted-500">{error}</p>
          <Link href="/" className="mt-6 btn-primary inline-block text-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="text-2xl font-bold text-muted-900 mb-2">Cancel Booking</h1>
        <p className="text-sm text-muted-500 mb-6">No login required. Review the details below before cancelling.</p>

        {/* Booking Details */}
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted-700 mb-4">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-500">Service</span>
              <span className="text-sm font-medium text-muted-900">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-500">Provider</span>
              <span className="text-sm font-medium text-muted-900">{providerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-500">Date</span>
              <span className="text-sm font-medium text-muted-900">{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-500">Time</span>
              <span className="text-sm font-medium text-muted-900">{startTimeStr} - {endTimeStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-500">Price</span>
              <span className="text-sm font-medium text-muted-900">₱{price}</span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Cancellation Policy */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Cancellation Policy</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>- Free cancellation up to 24 hours before the appointment</li>
            <li>- Cancellations within 24 hours may incur a 50% fee</li>
            <li>- No-shows are charged the full amount</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link href="/" className="flex-1 btn-secondary text-center">
            Keep Booking
          </Link>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 bg-danger-600 hover:bg-danger-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
