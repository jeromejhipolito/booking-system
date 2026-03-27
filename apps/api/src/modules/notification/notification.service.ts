import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OutboxEvent } from './outbox-event.entity';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { CalendarService } from './channels/calendar.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly calendarService: CalendarService,
  ) {}

  /**
   * Queue a notification event in the outbox for reliable processing
   */
  async queueEvent(eventType: string, payload: Record<string, any>): Promise<OutboxEvent> {
    const event = this.outboxRepo.create({
      eventType,
      payload,
    });
    return this.outboxRepo.save(event);
  }

  /**
   * Process a single outbox event by routing to the appropriate notification channel
   */
  async processEvent(event: OutboxEvent): Promise<void> {
    try {
      switch (event.eventType) {
        case 'booking.confirmed':
          await this.emailService.sendBookingConfirmation(event.payload);
          await this.calendarService.generateICalEvent(event.payload);
          break;

        case 'booking.cancelled':
          await this.emailService.sendBookingCancellation(event.payload);
          break;

        case 'booking.rescheduled':
          await this.emailService.sendBookingReschedule(event.payload);
          await this.calendarService.generateICalEvent(event.payload);
          break;

        case 'booking.reminder':
          await this.emailService.sendBookingReminder(event.payload);
          await this.smsService.sendBookingReminder(event.payload);
          break;

        default:
          this.logger.warn(`Unknown event type: ${event.eventType}`);
      }

      event.processed = true;
      event.processedAt = new Date();
      await this.outboxRepo.save(event);
    } catch (error: any) {
      event.retryCount += 1;
      event.error = error.message;

      if (event.retryCount >= 5) {
        event.processed = true; // Give up after 5 retries
        event.processedAt = new Date();
        this.logger.error(
          `Event ${event.id} failed after ${event.retryCount} retries: ${error.message}`,
        );
      }

      await this.outboxRepo.save(event);
    }
  }
}
