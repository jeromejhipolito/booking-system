'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DEMO_MODE, DEMO_SERVICES } from '../../../../lib/demo-data';
import { api } from '../../../../lib/api-client';
import ReviewsSection from '../../../../components/review/reviews-section';
import { useAvailability, isoToTime, type ApiSlot } from '@/hooks/use-availability';
import { format, addDays } from 'date-fns';

function getSlotsByPeriod(slots: ApiSlot[]) {
  const morning = slots.filter((s) => {
    const hour = new Date(s.startTime).getUTCHours();
    return hour >= 9 && hour < 12;
  });
  const afternoon = slots.filter((s) => {
    const hour = new Date(s.startTime).getUTCHours();
    return hour >= 12 && hour < 17;
  });
  const evening = slots.filter((s) => {
    const hour = new Date(s.startTime).getUTCHours();
    return hour >= 17;
  });
  return { morning, afternoon, evening };
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [service, setService] = useState<any>(null);

  // Booking state
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ApiSlot | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const providerId = service?.provider?.id;
  const { slots: rawSlots, isLoading: isLoadingSlots, usedFallback } = useAvailability(providerId, selectedDay || null);
  const availableSlots = rawSlots.filter((s) => s.available);
  const { morning, afternoon, evening } = getSlotsByPeriod(availableSlots);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i);
    return {
      date: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      monthName: format(d, 'MMM'),
      isToday: i === 0,
    };
  });

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

  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
    setSelectedSlot(null);
    setShowForm(false);
  };

  const handleSlotSelect = (slot: ApiSlot) => {
    setSelectedSlot(slot);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !selectedSlot) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const nameParts = name.trim().split(/\s+/);
      const customerFirstName = nameParts[0] || name.trim();
      const customerLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-';
      const idempotencyKey = crypto.randomUUID();

      const bookingData = {
        serviceId: service?.id,
        startTime: selectedSlot.startTime,
        customerEmail: email.trim(),
        customerFirstName,
        customerLastName,
        customerPhone: phone.trim(),
        notes: notes.trim() || undefined,
      };

      const result = await api.createBooking(bookingData, idempotencyKey) as any;

      if (typeof window !== 'undefined' && result?.id) {
        sessionStorage.setItem('lastBookingId', result.id);
        if (result.accessToken) {
          sessionStorage.setItem('lastBookingToken', result.accessToken);
        }
      }

      setBookingSuccess(true);
    } catch (err: any) {
      const msg = err.message || 'Booking failed';
      if (msg.includes('already booked') || msg.includes('conflict') || msg.includes('409')) {
        setSubmitError('This time slot has just been taken. Please choose a different time.');
      } else {
        setSubmitError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-12">
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
      <main className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h1>
        <p className="text-gray-500 mb-6">This service doesn&apos;t exist or has been removed.</p>
        <Link href="/services" className="text-primary-600 font-medium hover:text-primary-700">
          Browse all services
        </Link>
      </main>
    );
  }

  const renderSlotGroup = (label: string, slots: ApiSlot[], icon: React.ReactNode) => {
    if (slots.length === 0) return null;
    return (
      <div>
        <h4 className="text-xs font-semibold text-muted-600 mb-2 flex items-center gap-1.5">
          {icon} {label}
        </h4>
        <div className="grid grid-cols-3 gap-1.5">
          {slots.map((slot) => (
            <button
              key={slot.startTime}
              onClick={() => handleSlotSelect(slot)}
              className={`py-2 px-2 rounded-lg text-xs font-medium transition-all ${
                selectedSlot?.startTime === slot.startTime
                  ? 'bg-primary-600 text-white'
                  : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
              }`}
            >
              {isoToTime(slot.startTime)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/services" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-500 hover:text-muted-700 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to services
      </Link>

      {/* Two-column layout */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8" id="book">
        {/* Left — Service Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-muted-900">{service.name}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-muted-500">
              <span className="font-medium text-muted-700">{service.provider?.name || service.providerName}</span>
              {service.provider?.rating > 0 && (
                <>
                  <span className="text-yellow-400">★</span>
                  <span>{service.provider.rating} ({service.provider.reviewCount} reviews)</span>
                </>
              )}
            </div>
            {service.provider?.address && (
              <div className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-500">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {service.provider.address}
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className="px-4 py-3 rounded-xl bg-primary-50 border border-primary-100">
              <p className="text-xs text-muted-500 font-medium">Price</p>
              <p className="text-xl font-bold text-muted-900">₱{service.price.toLocaleString()}</p>
            </div>
            <div className="px-4 py-3 rounded-xl bg-muted-50 border border-muted-200">
              <p className="text-xs text-muted-500 font-medium">Duration</p>
              <p className="text-xl font-bold text-muted-900">{service.duration} min</p>
            </div>
          </div>

          {service.description && (
            <div>
              <h2 className="text-lg font-semibold text-muted-900 mb-2">About this service</h2>
              <p className="text-sm text-muted-600 leading-relaxed">{service.description}</p>
            </div>
          )}

          <ReviewsSection serviceId={serviceId} />

          {/* Technical footer — demo mode only */}
          {DEMO_MODE && (
            <div className="pt-6 mt-6 border-t border-muted-200">
              <p className="text-xs text-muted-400 leading-relaxed">
                Built solo by Jerome Hipolito · NestJS + Next.js 14
                <br />
                Double-booking prevented at the database level via PostgreSQL range exclusion
              </p>
              <a
                href="https://github.com/jeromejhipolito/booking-system/blob/main/apps/api/src/modules/booking"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-500 hover:text-primary-600 font-medium mt-1 inline-block"
              >
                View the booking engine source →
              </a>
            </div>
          )}
        </div>

        {/* Right — Booking Widget (sticky) */}
        <div className="mt-8 lg:mt-0">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white rounded-2xl border border-muted-200 shadow-sm p-5">
              {bookingSuccess ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-muted-900">Booking Confirmed!</h3>
                  <p className="text-sm text-muted-500 mt-2">
                    You&apos;ll receive a confirmation email at {email}.
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link href="/my-bookings" className="block btn-primary text-sm">
                      View My Bookings
                    </Link>
                    <button
                      onClick={() => {
                        setBookingSuccess(false);
                        setSelectedSlot(null);
                        setShowForm(false);
                        setName('');
                        setEmail('');
                        setPhone('');
                        setNotes('');
                      }}
                      className="block w-full text-sm text-primary-600 font-medium hover:text-primary-700"
                    >
                      Book another time
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-muted-900">Book this service</h3>
                    <span className="text-lg font-bold text-primary-700">₱{service.price.toLocaleString()}</span>
                  </div>

                  {/* Date picker */}
                  <p className="text-xs font-semibold text-muted-600 mb-2">Pick a date</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
                    {weekDays.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => handleDaySelect(day.date)}
                        className={`flex-shrink-0 w-16 py-2 rounded-lg border text-center transition-all ${
                          selectedDay === day.date
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-muted-200 hover:border-muted-300 text-muted-600'
                        }`}
                      >
                        <p className="text-[10px] font-medium uppercase">{day.dayName}</p>
                        <p className="text-lg font-bold leading-tight">{day.dayNum}</p>
                        {day.isToday && <p className="text-[9px] font-medium text-primary-600">Today</p>}
                      </button>
                    ))}
                  </div>

                  {/* Time slots */}
                  {!selectedDay && (
                    <p className="text-xs text-muted-400 text-center py-6">Select a date to see available times</p>
                  )}

                  {isLoadingSlots && selectedDay && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-9 bg-muted-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  )}

                  {selectedDay && !isLoadingSlots && (
                    <div className="space-y-3">
                      {usedFallback && (
                        <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-1.5">
                          Using estimated availability.
                        </p>
                      )}
                      {availableSlots.length === 0 ? (
                        <p className="text-xs text-muted-500 text-center py-6">No availability on this date</p>
                      ) : (
                        <>
                          {renderSlotGroup('Morning', morning, <span className="text-yellow-500">☀</span>)}
                          {renderSlotGroup('Afternoon', afternoon, <span className="text-orange-500">☀</span>)}
                          {renderSlotGroup('Evening', evening, <span className="text-indigo-500">☾</span>)}
                        </>
                      )}
                    </div>
                  )}

                  {/* Customer info form (inline expand) */}
                  {showForm && selectedSlot && (
                    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-muted-200 space-y-3">
                      <p className="text-xs font-semibold text-muted-600">
                        {isoToTime(selectedSlot.startTime)} on {selectedDay}
                      </p>

                      {submitError && (
                        <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
                          <p className="text-xs text-danger-700">{submitError}</p>
                        </div>
                      )}

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name *"
                        required
                        className="input-field text-sm"
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email *"
                        required
                        className="input-field text-sm"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+63 917 123 4567 *"
                        required
                        className="input-field text-sm"
                      />
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes (optional)"
                        rows={2}
                        className="input-field text-sm resize-none"
                      />
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary flex items-center justify-center"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Booking...
                          </>
                        ) : (
                          'Book This Time'
                        )}
                      </button>
                      <p className="text-[10px] text-muted-400 text-center">Free cancellation up to 24 hours before</p>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
