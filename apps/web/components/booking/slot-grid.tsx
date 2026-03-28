'use client';

import { useState } from 'react';
import { useAvailability, isoToTime, type ApiSlot } from '@/hooks/use-availability';
import { format, addDays } from 'date-fns';

interface SlotGridProps {
  providerId: string | undefined;
  onSlotSelect?: (slot: ApiSlot, date: string) => void;
  selectedSlotStart?: string;
}

export default function SlotGrid({ providerId, onSlotSelect, selectedSlotStart }: SlotGridProps) {
  const today = new Date();
  const days = Array.from({ length: 5 }).map((_, i) => {
    const d = addDays(today, i);
    return {
      date: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE d'),
      isToday: i === 0,
    };
  });

  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Fetch slots for each day
  const day0 = useAvailability(providerId, days[0]?.date);
  const day1 = useAvailability(providerId, days[1]?.date);
  const day2 = useAvailability(providerId, days[2]?.date);
  const day3 = useAvailability(providerId, days[3]?.date);
  const day4 = useAvailability(providerId, days[4]?.date);

  const daySlots = [day0, day1, day2, day3, day4];

  // Collect all unique time labels across all days
  const allTimes = new Set<string>();
  daySlots.forEach((ds) => {
    ds.slots.forEach((slot) => {
      allTimes.add(isoToTime(slot.startTime));
    });
  });
  const timeLabels = Array.from(allTimes).sort();

  const isLoading = daySlots.some((ds) => ds.isLoading);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (timeLabels.length === 0) {
    return <p className="text-sm text-muted-400 text-center py-4">No availability data</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left py-1 px-2 text-muted-500 font-medium w-16" />
            {days.map((day, colIdx) => (
              <th
                key={day.date}
                className={`text-center py-1 px-1 font-medium transition-colors ${
                  hoveredCol === colIdx ? 'bg-muted-100 text-muted-900' : 'text-muted-500'
                }`}
              >
                {day.label}
                {day.isToday && <span className="block text-[9px] text-primary-600">Today</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeLabels.map((time) => (
            <tr key={time}>
              <td
                className={`py-1 px-2 font-medium transition-colors ${
                  hoveredRow === time ? 'bg-muted-100 text-muted-900' : 'text-muted-500'
                }`}
              >
                {time}
              </td>
              {daySlots.map((ds, colIdx) => {
                const slot = ds.slots.find((s) => isoToTime(s.startTime) === time);
                const isAvailable = slot?.available;
                const isSelected = slot && selectedSlotStart === slot.startTime;

                return (
                  <td key={colIdx} className="py-0.5 px-0.5">
                    {slot ? (
                      <button
                        disabled={!isAvailable}
                        onClick={() => isAvailable && onSlotSelect?.(slot, days[colIdx].date)}
                        onMouseEnter={() => { setHoveredCol(colIdx); setHoveredRow(time); }}
                        onMouseLeave={() => { setHoveredCol(null); setHoveredRow(null); }}
                        className={`w-full py-1.5 rounded text-center transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : isAvailable
                            ? 'bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100'
                            : 'opacity-30 cursor-not-allowed bg-muted-100 text-muted-400'
                        }`}
                      >
                        {isAvailable ? '·' : '—'}
                      </button>
                    ) : (
                      <div className="w-full py-1.5 text-center text-muted-200">·</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
