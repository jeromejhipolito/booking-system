'use client';

import { useState, useEffect } from 'react';
import { useBookingStore } from '@/stores/booking-store';
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

export default function DateTimeStep() {
  const { selectedService, selectedDate, selectedSlot, setSelectedDate, setSelectedSlot, nextStep, prevStep } =
    useBookingStore();

  const [selectedDay, setSelectedDay] = useState<string>(selectedDate || '');

  // Derive the providerId from the selected service
  const providerId = selectedService?.provider?.id;

  // Use real availability API (falls back to mock if endpoint is unavailable)
  const { slots: rawSlots, isLoading: isLoadingSlots, usedFallback } = useAvailability(providerId, selectedDay || null);

  const availableSlots = rawSlots.filter((s) => s.available);
  const { morning, afternoon, evening } = getSlotsByPeriod(availableSlots);
  const slotsLoaded = !!selectedDay && !isLoadingSlots;

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

  const handleDaySelect = (date: string) => {
    setSelectedDay(date);
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // If date was already selected (coming back), restore it
  useEffect(() => {
    if (selectedDate && !selectedDay) {
      setSelectedDay(selectedDate);
    }
  }, [selectedDate, selectedDay]);

  const handleSlotSelect = (slot: ApiSlot) => {
    // Convert to the shape the booking store expects
    setSelectedSlot({
      id: slot.startTime, // use startTime ISO as a unique ID
      startTime: isoToTime(slot.startTime),
      endTime: isoToTime(slot.endTime),
      available: slot.available,
      _isoStart: slot.startTime,
      _isoEnd: slot.endTime,
    } as any);
  };

  const handleContinue = () => {
    if (selectedDay && selectedSlot) {
      nextStep();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-muted-900 mb-1">Pick a Date &amp; Time</h2>
      <p className="text-sm text-muted-500 mb-6">Choose when you would like your appointment</p>

      {/* Week View */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {weekDays.map((day) => (
          <button
            key={day.date}
            onClick={() => handleDaySelect(day.date)}
            className={`flex-shrink-0 w-20 py-3 rounded-xl border-2 text-center transition-all ${
              selectedDay === day.date
                ? 'border-blue-600 bg-primary-50 text-primary-700'
                : 'border-muted-200 hover:border-muted-300 text-muted-600'
            }`}
          >
            <p className="text-xs font-medium uppercase">{day.dayName}</p>
            <p className="text-xl font-bold mt-0.5">{day.dayNum}</p>
            <p className="text-xs">{day.monthName}</p>
            {day.isToday && (
              <p className="text-[10px] font-medium text-primary-600 mt-0.5">Today</p>
            )}
          </button>
        ))}
      </div>

      {/* Slots */}
      {!selectedDay && (
        <div className="text-center py-12 text-muted-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Select a date to see available time slots</p>
        </div>
      )}

      {isLoadingSlots && selectedDay && (
        <div className="space-y-4">
          <div className="h-5 bg-muted-200 rounded w-24 animate-pulse" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-11 bg-muted-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {slotsLoaded && selectedDay && (
        <div className="space-y-6">
          {usedFallback && (
            <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg px-3 py-2">
              Using estimated availability. Real-time slots could not be loaded.
            </p>
          )}

          {availableSlots.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 mx-auto text-muted-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-muted-500 font-medium">No availability on this date</p>
              <p className="text-sm text-muted-400 mt-1">Try selecting a different day</p>
            </div>
          ) : (
            <>
              {/* Morning Slots */}
              {morning.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Morning
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {morning.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotSelect(slot)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedSlot?.id === slot.startTime
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                        }`}
                        style={{ height: 'var(--slot-height)' }}
                      >
                        {isoToTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Afternoon Slots */}
              {afternoon.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Afternoon
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {afternoon.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotSelect(slot)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedSlot?.id === slot.startTime
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                        }`}
                        style={{ height: 'var(--slot-height)' }}
                      >
                        {isoToTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evening Slots */}
              {evening.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-700 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Evening
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {evening.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => handleSlotSelect(slot)}
                        className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedSlot?.id === slot.startTime
                            ? 'bg-blue-600 text-white'
                            : 'bg-muted-100 text-muted-700 hover:bg-muted-200'
                        }`}
                        style={{ height: 'var(--slot-height)' }}
                      >
                        {isoToTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-muted-200">
        <button onClick={prevStep} className="btn-secondary">
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedDay || !selectedSlot}
          className="btn-primary disabled:opacity-50"
        >
          Continue to Confirmation
        </button>
      </div>
    </div>
  );
}
