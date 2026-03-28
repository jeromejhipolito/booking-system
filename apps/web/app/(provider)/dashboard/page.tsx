'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface BookingRecord {
  id: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string;
  service?: { name: string; price: string };
  provider?: { businessName: string };
  customer?: { email: string; firstName: string; lastName: string; phone: string };
}

interface BookingsResponse {
  data: BookingRecord[];
  total: number;
  page: number;
  limit: number;
}

export default function ProviderDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
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

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => {
    const bDate = b.startTime?.split('T')[0];
    return (bDate === todayStr) && (b.status === 'confirmed' || b.status === 'pending');
  });

  const allActive = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );

  const totalRevenue = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + parseFloat(b.service?.price || '0'), 0);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const noShowCount = bookings.filter((b) => b.status === 'no_show').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const noShowRate = completedCount + noShowCount > 0
    ? Math.round((noShowCount / (completedCount + noShowCount)) * 100)
    : 0;
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const stats = [
    { label: "Today's Bookings", value: String(todayBookings.length), change: `${allActive.length} total active`, color: 'text-primary-600' },
    { label: 'Revenue (Total)', value: `₱${totalRevenue.toLocaleString()}`, change: `${bookings.length} bookings`, color: 'text-success-600' },
    { label: 'Pending', value: String(pendingCount), change: pendingCount > 0 ? 'Needs action' : 'All clear', color: 'text-yellow-600' },
    { label: 'No-Show Rate', value: `${noShowRate}%`, change: `${noShowCount} no-shows`, color: noShowRate > 10 ? 'text-danger-600' : 'text-primary-600' },
  ];

  const handleRowClick = (bookingId: string) => {
    setExpandedRow(expandedRow === bookingId ? null : bookingId);
  };

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
    } catch {
      return '';
    }
  };

  // Show all active bookings (not just today's) in the agenda
  const agendaBookings = allActive.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-muted-900">Dashboard</h1>
        <p className="text-sm text-muted-500 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 bg-muted-200 rounded w-24 mb-3" />
              <div className="h-7 bg-muted-200 rounded w-16 mb-2" />
              <div className="h-3 bg-muted-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-5">
              <p className="text-sm text-muted-500">{stat.label}</p>
              <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-400 mt-1">{stat.change}</p>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="mb-4 bg-danger-50 border border-danger-200 rounded-lg p-4">
          <p className="text-sm text-danger-700">Failed to load bookings: {error}</p>
        </div>
      )}

      {/* Agenda */}
      <div className="card">
        <div className="px-6 py-4 border-b border-muted-200">
          <h2 className="text-lg font-semibold text-muted-900">Upcoming Bookings</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-16 bg-muted-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-muted-200 rounded w-48 mb-2" />
                  <div className="h-3 bg-muted-200 rounded w-32" />
                </div>
                <div className="h-6 w-20 bg-muted-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : agendaBookings.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-muted-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-muted-500 font-medium">No upcoming bookings</p>
            <p className="text-sm text-muted-400 mt-1">Your schedule is clear</p>
          </div>
        ) : (
          <div className="divide-y divide-muted-100">
            {agendaBookings.map((booking) => (
              <div key={booking.id}>
                <button
                  onClick={() => handleRowClick(booking.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted-50 transition-colors text-left"
                  style={{ minHeight: 'var(--calendar-row)' }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[4rem]">
                      <p className="text-sm font-bold text-muted-900">{formatTime(booking.startTime)}</p>
                      <p className="text-xs text-muted-400">{formatTime(booking.endTime)}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-900">{booking.service?.name || 'Service'}</p>
                      <p className="text-sm text-muted-500">
                        {booking.customer ? `${booking.customer.firstName} ${booking.customer.lastName}` : 'Customer'}
                      </p>
                      <p className="text-xs text-muted-400">{booking.startTime?.split('T')[0]}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-success-50 text-success-700'
                          : booking.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-muted-100 text-muted-600'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <svg
                      className={`w-4 h-4 text-muted-400 transition-transform ${
                        expandedRow === booking.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedRow === booking.id && (
                  <div className="px-6 pb-4 bg-muted-50">
                    <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-white border border-muted-200">
                      <div>
                        <p className="text-xs text-muted-400">Email</p>
                        <p className="text-sm text-muted-700">{booking.customer?.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-400">Phone</p>
                        <p className="text-sm text-muted-700">{booking.customer?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-400">Price</p>
                        <p className="text-sm font-medium text-muted-700">₱{booking.service?.price || '0'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-400">Notes</p>
                        <p className="text-sm text-muted-700">{booking.notes || 'None'}</p>
                      </div>
                      {/* No-Show button for past confirmed bookings */}
                      {booking.status === 'confirmed' && new Date(booking.startTime) < new Date() && (
                        <div className="col-span-2 pt-2">
                          <button
                            onClick={async () => {
                              try {
                                await apiClient(`/bookings/${booking.id}`, {
                                  method: 'PATCH',
                                  body: JSON.stringify({ status: 'no_show' }),
                                });
                                setBookings((prev) =>
                                  prev.map((b) => b.id === booking.id ? { ...b, status: 'no_show' } : b),
                                );
                              } catch (err: any) {
                                console.warn('Failed to mark no-show:', err.message);
                              }
                            }}
                            className="text-xs font-medium text-danger-600 hover:text-danger-700 px-3 py-1.5 rounded-lg hover:bg-danger-50 border border-danger-200 transition-colors"
                          >
                            Mark No-Show
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Insights */}
      {cancelledBookings.length > 0 && (
        <div className="card mt-6">
          <div className="px-6 py-4 border-b border-muted-200">
            <h2 className="text-lg font-semibold text-muted-900">Cancellation Insights</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-500 mb-3">
              {cancelledBookings.length} cancellation{cancelledBookings.length !== 1 ? 's' : ''} total
            </p>
            <div className="space-y-2">
              {['Schedule conflict', 'Found a cheaper option', 'Provider unresponsive', 'Personal emergency', 'Other'].map((reason) => {
                const count = cancelledBookings.filter((b) => b.notes?.includes(reason)).length;
                if (count === 0) return null;
                const pct = Math.round((count / cancelledBookings.length) * 100);
                return (
                  <div key={reason} className="flex items-center justify-between text-sm">
                    <span className="text-muted-700">{reason}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-muted-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
