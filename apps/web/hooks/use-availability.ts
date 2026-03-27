'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export interface ApiSlot {
  startTime: string; // ISO string e.g. "2026-03-27T09:00:00.000Z"
  endTime: string;   // ISO string
  available: boolean;
}

interface AvailabilityResponse {
  providerId: string;
  date: string;
  timezone: string;
  slots: ApiSlot[];
}

/**
 * Normalise an ISO timestamp to "HH:mm" display format.
 */
export function isoToTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
}

export function useAvailability(providerId: string | undefined, date: string | null) {
  const [slots, setSlots] = useState<ApiSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const fetchSlots = useCallback(async () => {
    if (!providerId || !date) {
      setSlots([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setUsedFallback(false);

    try {
      const data = await apiClient<AvailabilityResponse>(
        `/availability/slots?providerId=${encodeURIComponent(providerId)}&date=${encodeURIComponent(date)}`,
        { skipAuth: true },
      );

      const availableSlots = data.slots ?? [];
      setSlots(availableSlots);
    } catch (err: any) {
      console.warn('Availability API failed, falling back to mock data:', err.message);
      setError(err.message);
      setUsedFallback(true);

      // Generate fallback mock slots for the given date
      const fallbackSlots: ApiSlot[] = [];
      const times = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30',
      ];
      for (const t of times) {
        const startIso = `${date}T${t}:00.000Z`;
        const [h, m] = t.split(':').map(Number);
        const endMin = m + 30;
        const endH = h + Math.floor(endMin / 60);
        const endM = endMin % 60;
        const endIso = `${date}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00.000Z`;
        fallbackSlots.push({
          startTime: startIso,
          endTime: endIso,
          available: Math.random() > 0.2, // ~80% available
        });
      }
      setSlots(fallbackSlots);
    } finally {
      setIsLoading(false);
    }
  }, [providerId, date]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, isLoading, error, usedFallback, refetch: fetchSlots };
}
