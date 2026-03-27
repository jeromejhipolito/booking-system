'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useBookingStore } from '@/stores/booking-store';

export default function BookingConfirmedPage() {
  const { selectedService, selectedDate, selectedSlot, customerInfo, reset } = useBookingStore();

  const [bookingId, setBookingId] = useState<string>('');
  const [bookingToken, setBookingToken] = useState<string>('');

  useEffect(() => {
    // Read the real booking ID from sessionStorage (set by confirmation step)
    const storedId = sessionStorage.getItem('lastBookingId');
    const storedToken = sessionStorage.getItem('lastBookingToken');
    if (storedId) {
      setBookingId(storedId);
      // Clean up
      sessionStorage.removeItem('lastBookingId');
    } else {
      // Fallback mock ID
      setBookingId('BK-' + Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    if (storedToken) {
      setBookingToken(storedToken);
      sessionStorage.removeItem('lastBookingToken');
    }
  }, []);

  // Build cancel URL with token if available
  const cancelUrl = bookingToken
    ? `/cancel/${bookingId}?token=${encodeURIComponent(bookingToken)}`
    : `/cancel/${bookingId}`;
  const rescheduleUrl = bookingToken
    ? `/reschedule/${bookingId}?token=${encodeURIComponent(bookingToken)}`
    : `/reschedule/${bookingId}`;

  return (
    <div className="min-h-screen bg-muted-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-muted-900">Booking Confirmed!</h1>
          <p className="mt-2 text-muted-500">
            Your appointment has been successfully booked.
          </p>

          {/* Booking Reference */}
          <div className="mt-4 inline-block px-4 py-2 bg-muted-100 rounded-lg">
            <p className="text-xs text-muted-500">Booking Reference</p>
            <p className="text-lg font-bold text-muted-900">{bookingId ? bookingId.substring(0, 8).toUpperCase() : '...'}</p>
          </div>

          {/* Details */}
          <div className="mt-6 bg-muted-50 rounded-xl p-5 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-500">Service</span>
                <span className="text-sm font-medium text-muted-900">{selectedService?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-500">Provider</span>
                <span className="text-sm font-medium text-muted-900">{selectedService?.provider.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-500">Date</span>
                <span className="text-sm font-medium text-muted-900">{selectedDate || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-500">Time</span>
                <span className="text-sm font-medium text-muted-900">
                  {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-500">Customer</span>
                <span className="text-sm font-medium text-muted-900">{customerInfo.name || 'Guest'}</span>
              </div>
            </div>
          </div>

          {/* Calendar Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="flex-1 btn-secondary text-sm flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add to Google Calendar
            </button>
            <button className="flex-1 btn-secondary text-sm flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Add to Apple Calendar
            </button>
          </div>

          {/* Action Links */}
          <div className="mt-6 pt-6 border-t border-muted-200 space-y-3">
            <div className="flex gap-3 justify-center">
              <Link
                href={rescheduleUrl}
                className="text-sm text-primary-600 font-medium hover:text-primary-700"
              >
                Reschedule
              </Link>
              <span className="text-muted-300">|</span>
              <Link
                href={cancelUrl}
                className="text-sm text-danger-600 font-medium hover:text-danger-700"
              >
                Cancel Booking
              </Link>
            </div>

            <Link
              href="/my-bookings"
              onClick={() => reset()}
              className="block btn-primary text-sm w-full text-center mt-4"
            >
              View My Bookings
            </Link>
            <Link
              href="/services"
              onClick={() => reset()}
              className="block text-sm text-center mt-2 text-muted-500 hover:text-muted-700"
            >
              Browse More Services
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
