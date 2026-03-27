'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface BookingRecord {
  id: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  accessToken?: string;
  service?: { name: string; price: string };
  provider?: { businessName: string };
  customer?: { email: string; firstName: string; lastName: string };
}

interface BookingsResponse {
  data: BookingRecord[];
  total: number;
  page: number;
  limit: number;
}

export default function CustomerDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await apiClient<BookingsResponse>('/bookings?limit=50');
        setBookings(data.data || []);
      } catch (err: any) {
        console.warn('Failed to fetch bookings:', err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === 'confirmed' || b.status === 'pending') &&
      new Date(b.startTime) >= now,
  );

  const pastBookings = bookings.filter(
    (b) =>
      b.status === 'completed' ||
      b.status === 'cancelled' ||
      ((b.status === 'confirmed' || b.status === 'pending') && new Date(b.startTime) < now),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-50 text-success-700';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'completed':
        return 'bg-muted-100 text-muted-600';
      case 'cancelled':
        return 'bg-danger-50 text-danger-700';
      default:
        return 'bg-muted-100 text-muted-600';
    }
  };

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
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-muted-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-muted-900">My Bookings</h1>
          <p className="text-sm text-muted-500 mt-1">View and manage your appointments</p>
        </div>

        {/* Error */}
        {error && !isLoading && (
          <div className="mb-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
            <p className="text-sm text-danger-700">Failed to load bookings: {error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="flex justify-between">
                  <div>
                    <div className="h-5 bg-muted-200 rounded w-40 mb-2" />
                    <div className="h-4 bg-muted-200 rounded w-32 mb-2" />
                    <div className="h-4 bg-muted-200 rounded w-48" />
                  </div>
                  <div className="h-6 w-20 bg-muted-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Upcoming Bookings */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-muted-900 mb-4">
                Upcoming ({upcomingBookings.length})
              </h2>
              {upcomingBookings.length === 0 ? (
                <div className="card p-12 text-center">
                  <svg className="w-12 h-12 mx-auto text-muted-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-muted-500 font-medium">No upcoming bookings</p>
                  <p className="text-sm text-muted-400 mt-1">Book a service to get started</p>
                  <Link href="/services" className="mt-4 btn-primary inline-block text-sm">
                    Browse Services
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="card p-5 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-muted-900">{booking.service?.name || 'Service'}</h3>
                          <p className="text-sm text-muted-500">{booking.provider?.businessName || 'Provider'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(booking.startTime)}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={`/reschedule/${booking.id}${booking.accessToken ? `?token=${encodeURIComponent(booking.accessToken)}` : ''}`}
                              className="text-sm text-primary-600 font-medium hover:text-primary-700"
                            >
                              Reschedule
                            </Link>
                            <Link
                              href={`/cancel/${booking.id}${booking.accessToken ? `?token=${encodeURIComponent(booking.accessToken)}` : ''}`}
                              className="text-sm text-danger-600 font-medium hover:text-danger-700"
                            >
                              Cancel
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            <div>
              <h2 className="text-lg font-semibold text-muted-900 mb-4">
                Past ({pastBookings.length})
              </h2>
              {pastBookings.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-muted-500">No past bookings</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <div key={booking.id} className="card p-5 opacity-75">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-muted-900">{booking.service?.name || 'Service'}</h3>
                          <p className="text-sm text-muted-500">{booking.provider?.businessName || 'Provider'}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-600">
                            <span>{formatDate(booking.startTime)}</span>
                            <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusBadge(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className="text-sm font-medium text-muted-700">${booking.service?.price || '0'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
