'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format, isPast, parseISO } from 'date-fns';
import { api } from '../../../lib/api-client';
import ReviewForm from '../../../components/booking/review-form';
import StarRating from '../../../components/ui/star-rating';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  durationMinutes: number;
  accessToken?: string;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-success-50 text-success-700',
  pending: 'bg-warning-50 text-warning-700',
  completed: 'bg-primary-50 text-primary-700',
  cancelled: 'bg-muted-100 text-muted-500',
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [reviewingBookingId, setReviewingBookingId] = useState<string | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Record<string, number>>({});

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const result: any = await api.get('/bookings?limit=50');
      setBookings(result.data || result || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const upcoming = bookings.filter((b) => {
    const isFuture = !isPast(parseISO(b.startTime));
    return isFuture && (b.status === 'confirmed' || b.status === 'pending');
  });

  const past = bookings.filter((b) => {
    const isFuture = !isPast(parseISO(b.startTime));
    return !isFuture || b.status === 'completed' || b.status === 'cancelled';
  });

  const displayedBookings = activeTab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-muted-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-muted-900 mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-white text-muted-900 shadow-sm'
                : 'text-muted-500 hover:text-muted-700'
            }`}
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'past'
                ? 'bg-white text-muted-900 shadow-sm'
                : 'text-muted-500 hover:text-muted-700'
            }`}
          >
            Past ({past.length})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-muted-200 rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted-100 rounded w-1/4 mb-2" />
                <div className="h-4 bg-muted-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card p-6 text-center">
            <p className="text-danger-600 mb-4">{error}</p>
            <button onClick={fetchBookings} className="btn-primary text-sm">
              Retry
            </button>
          </div>
        )}

        {/* Bookings List */}
        {!loading && !error && displayedBookings.length === 0 && (
          <div className="card p-8 text-center">
            <svg className="w-12 h-12 mx-auto text-muted-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-muted-600 font-medium mb-1">
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            <p className="text-sm text-muted-400 mb-4">
              {activeTab === 'upcoming'
                ? 'Browse services and book your first appointment'
                : 'Your completed bookings will appear here'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/services" className="btn-primary text-sm inline-block">
                Browse Services
              </Link>
            )}
          </div>
        )}

        {!loading && !error && displayedBookings.length > 0 && (
          <div className="space-y-4">
            {displayedBookings.map((booking) => (
              <div key={booking.id} className="card p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-muted-900">{booking.serviceName}</h3>
                    <p className="text-sm text-muted-500">{booking.providerName}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[booking.status] || 'bg-muted-100 text-muted-500'}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-600 mb-4">
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(parseISO(booking.startTime), 'MMM d, yyyy')} at {format(parseISO(booking.startTime), 'h:mm a')}
                  <span className="mx-2">-</span>
                  ₱{booking.price.toLocaleString()} / {booking.durationMinutes}min
                </div>
                <div className="flex justify-end space-x-3">
                  {activeTab === 'upcoming' && (
                    <>
                      <Link
                        href={`/reschedule/${booking.id}${booking.accessToken ? `?token=${booking.accessToken}` : ''}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Reschedule
                      </Link>
                      <Link
                        href={`/cancel/${booking.id}${booking.accessToken ? `?token=${booking.accessToken}` : ''}`}
                        className="text-sm font-medium text-danger-600 hover:text-danger-700 px-3 py-1.5 rounded-lg hover:bg-danger-50 transition-colors"
                      >
                        Cancel
                      </Link>
                    </>
                  )}
                  {activeTab === 'past' && booking.status === 'completed' && (
                    <>
                      {reviewedBookings[booking.id] ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-500">
                          <span>Reviewed</span>
                          <StarRating value={reviewedBookings[booking.id]} size="sm" readonly />
                        </div>
                      ) : (
                        <button
                          onClick={() => setReviewingBookingId(reviewingBookingId === booking.id ? null : booking.id)}
                          className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          Leave a Review
                        </button>
                      )}
                      <Link
                        href={`/book?serviceId=${booking.serviceId}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                      >
                        Rebook
                      </Link>
                    </>
                  )}
                </div>
                {reviewingBookingId === booking.id && (
                  <ReviewForm
                    bookingId={booking.id}
                    onSuccess={(rating) => {
                      setReviewedBookings((prev) => ({ ...prev, [booking.id]: rating }));
                      setReviewingBookingId(null);
                    }}
                    onCancel={() => setReviewingBookingId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
