import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Not, In } from 'typeorm';
import { RRule } from 'rrule';
import { AvailabilityRule } from './availability-rule.entity';
import { Booking } from '../booking/booking.entity';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

@Injectable()
export class SlotExpansionService {
  constructor(
    @InjectRepository(AvailabilityRule)
    private readonly ruleRepo: Repository<AvailabilityRule>,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  /**
   * Expand availability rules into concrete time slots for a given date.
   *
   * Steps:
   * 1. Load active rules for the provider
   * 2. For each rule, expand RRULE occurrences to check if the rule applies on the target date
   * 3. Apply exceptions (blocked dates)
   * 4. Split the available time window into slots based on duration + buffer
   * 5. Query bookings to mark occupied slots
   * 6. Filter out slots that violate minAdvanceHours
   */
  async getAvailableSlots(
    providerId: string,
    date: string,
    durationMinutes: number,
    bufferMinutes: number,
    minAdvanceHours: number,
    timezone: string = 'UTC',
  ): Promise<TimeSlot[]> {
    // Load active rules for this provider
    const rules = await this.ruleRepo.find({
      where: { providerId, isActive: true },
    });

    if (rules.length === 0) {
      return [];
    }

    // Parse the target date
    const targetDate = new Date(date + 'T00:00:00Z');
    const targetDateStr = date; // YYYY-MM-DD

    // Collect all available windows for this date
    const availableWindows: Array<{ start: Date; end: Date }> = [];

    for (const rule of rules) {
      // Check if any exception blocks this date
      const isExcepted = rule.exceptions.some(
        (exc) => exc.date === targetDateStr,
      );
      if (isExcepted) {
        continue;
      }

      // Parse the RRULE and check if it occurs on the target date
      try {
        const rrule = RRule.fromString(rule.rrule);

        // Get occurrences for a window around the target date
        const dayStart = new Date(date + 'T00:00:00Z');
        const dayEnd = new Date(date + 'T23:59:59Z');
        const occurrences = rrule.between(dayStart, dayEnd, true);

        if (occurrences.length > 0) {
          // This rule applies on this date, create the time window
          const [startHour, startMin] = rule.startTime.split(':').map(Number);
          const [endHour, endMin] = rule.endTime.split(':').map(Number);

          const windowStart = new Date(date + 'T00:00:00Z');
          windowStart.setUTCHours(startHour, startMin, 0, 0);

          const windowEnd = new Date(date + 'T00:00:00Z');
          windowEnd.setUTCHours(endHour, endMin, 0, 0);

          if (windowEnd > windowStart) {
            availableWindows.push({ start: windowStart, end: windowEnd });
          }
        }
      } catch (e) {
        // If RRULE parsing fails, skip this rule
        console.warn(`Failed to parse RRULE for rule ${rule.id}: ${e}`);
        continue;
      }
    }

    if (availableWindows.length === 0) {
      return [];
    }

    // Split windows into slots
    const allSlots: TimeSlot[] = [];
    const slotDuration = durationMinutes * 60 * 1000;
    const buffer = bufferMinutes * 60 * 1000;
    const step = slotDuration + buffer;

    for (const window of availableWindows) {
      let current = window.start.getTime();
      const windowEnd = window.end.getTime();

      while (current + slotDuration <= windowEnd) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current + slotDuration);

        allSlots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          available: true,
        });

        current += step;
      }
    }

    if (allSlots.length === 0) {
      return [];
    }

    // Query existing bookings that overlap with our date range
    const dayStart = new Date(date + 'T00:00:00Z');
    const dayEnd = new Date(date + 'T23:59:59Z');

    const existingBookings = await this.bookingRepo.find({
      where: {
        providerId,
        status: Not(In(['cancelled'])),
        startTime: Between(dayStart, dayEnd),
      },
    });

    // Mark slots as unavailable if they overlap with existing bookings
    const now = new Date();
    const minAdvanceMs = minAdvanceHours * 60 * 60 * 1000;

    return allSlots.map((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      // Check minimum advance time
      if (slotStart.getTime() - now.getTime() < minAdvanceMs) {
        return { ...slot, available: false };
      }

      // Check if any booking overlaps
      const isOccupied = existingBookings.some((booking) => {
        const bookingStart = new Date(booking.startTime);
        const bookingEnd = new Date(booking.endTime);
        return slotStart < bookingEnd && slotEnd > bookingStart;
      });

      if (isOccupied) {
        return { ...slot, available: false };
      }

      return slot;
    });
  }
}
