import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';
import { format } from 'date-fns';

/**
 * Convert a local date/time in a given timezone to UTC
 */
export function toUTC(date: Date | string, timezone: string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return fromZonedTime(d, timezone);
}

/**
 * Convert a UTC date to local date/time in a given timezone
 */
export function fromUTC(date: Date | string, timezone: string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return toZonedTime(d, timezone);
}

/**
 * Detect the user's timezone from the environment
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Format a time slot for display in a given timezone
 */
export function formatSlotDisplay(
  startTime: Date | string,
  endTime: Date | string,
  timezone: string,
): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;

  const startStr = formatInTimeZone(start, timezone, 'h:mm a');
  const endStr = formatInTimeZone(end, timezone, 'h:mm a');
  const dateStr = formatInTimeZone(start, timezone, 'EEE, MMM d');

  return `${dateStr} ${startStr} - ${endStr}`;
}

/**
 * Check if two timezones are different (potential mismatch)
 */
export function isTimezoneMismatch(tz1: string, tz2: string): boolean {
  if (tz1 === tz2) return false;
  try {
    const now = new Date();
    const offset1 = formatInTimeZone(now, tz1, 'xxx');
    const offset2 = formatInTimeZone(now, tz2, 'xxx');
    return offset1 !== offset2;
  } catch {
    return true;
  }
}
