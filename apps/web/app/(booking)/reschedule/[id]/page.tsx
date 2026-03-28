'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_BOOKINGS, MOCK_SLOTS, getSlotsByPeriod } from '@/lib/mock-data';
import { format, addDays } from 'date-fns';

export default function ReschedulePage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsLoaded, setSlotsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const booking = MOCK_BOOKINGS[0]; // Use first booking as mock

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const today = new Date();
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i + 1);
    return {
      date: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
      dayNum: format(d, 'd'),
      monthName: format(d, 'MMM'),
    };
  });

  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
    setSelectedSlotId(null);
    setSlotsLoaded(false);
    setIsLoadingSlots(true);
    setTimeout(() => {
      setIsLoadingSlots(false);
      setSlotsLoaded(true);
    }, 500);
  };

  const availableSlots = MOCK_SLOTS.filter((s) => s.available);
  const { morning, afternoon, evening } = getSlotsByPeriod(availableSlots);

  const handleReschedule = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-muted-50 flex items-center justify-center px-4 py-12">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-muted-900">Rescheduled!</h1>
          <p className="mt-2 text-muted-500">Your appointment has been rescheduled to {selectedDay} at {availableSlots.find(s => s.id === selectedSlotId)?.startTime}.</p>
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
        <div className="max-w-2xl mx-auto px-4">
          <div className="card p-8 animate-pulse">
            <div className="h-6 bg-muted-200 rounded w-48 mb-4" />
            <div className="h-4 bg-muted-200 rounded w-64 mb-8" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-muted-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-muted-900 mb-2">Reschedule Booking</h1>
        <p className="text-sm text-muted-500 mb-6">No login required. Choose a new date and time for your appointment.</p>

        {/* Current Booking Details */}
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-muted-700 mb-3">Current Booking</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-400">Service</p>
              <p className="font-medium text-muted-900">{booking.serviceName}</p>
            </div>
            <div>
              <p className="text-muted-400">Provider</p>
              <p className="font-medium text-muted-900">{booking.providerName}</p>
            </div>
            <div>
              <p className="text-muted-400">Date</p>
              <p className="font-medium text-muted-900">{booking.date}</p>
            </div>
            <div>
              <p className="text-muted-400">Time</p>
              <p className="font-medium text-muted-900">{booking.startTime} - {booking.endTime}</p>
            </div>
          </div>
        </div>

        {/* New Date Selection */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-muted-900 mb-4">Select New Date &amp; Time</h2>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {weekDays.map((day) => (
              <button
                key={day.date}
                onClick={() => handleDaySelect(day.date)}
                className={`flex-shrink-0 w-20 py-3 rounded-xl border-2 text-center transition-all ${
                  selectedDay === day.date
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-muted-200 hover:border-muted-300 text-muted-600'
                }`}
              >
                <p className="text-xs font-medium uppercase">{day.dayName}</p>
                <p className="text-xl font-bold mt-0.5">{day.dayNum}</p>
                <p className="text-xs">{day.monthName}</p>
              </button>
            ))}
          </div>

          {isLoadingSlots && (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-11 bg-muted-200 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {slotsLoaded && !isLoadingSlots && (
            <div className="space-y-4">
              {availableSlots.length === 0 ? (
                <p className="text-center text-muted-500 py-8">No availability on this date</p>
              ) : (
                <>
                  {morning.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-600 mb-2">Morning</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {morning.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedSlotId === slot.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {afternoon.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-600 mb-2">Afternoon</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {afternoon.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedSlotId === slot.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {evening.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-muted-600 mb-2">Evening</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {evening.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                              selectedSlotId === slot.id
                                ? 'bg-primary-600 text-white'
                                : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                            }`}
                          >
                            {slot.startTime}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Link href="/" className="btn-secondary">Cancel</Link>
            <button
              onClick={handleReschedule}
              disabled={!selectedDay || !selectedSlotId || isSubmitting}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Rescheduling...
                </>
              ) : (
                'Confirm Reschedule'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
