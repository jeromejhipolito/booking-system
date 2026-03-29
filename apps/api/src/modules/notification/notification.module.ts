import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { OutboxEvent } from './outbox-event.entity';
import { NotificationService } from './notification.service';
import { OutboxProcessorService } from './outbox-processor.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { CalendarService } from './channels/calendar.service';
import { ReminderSchedulerService } from './scheduler/reminder-scheduler.service';
import { BookingConfirmedHandler, BookingCancelledHandler, BookingRescheduledHandler } from './handlers/booking-events.handler';
import { Booking } from '../booking/booking.entity';

const EventHandlers = [
  BookingConfirmedHandler,
  BookingCancelledHandler,
  BookingRescheduledHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEvent, Booking]),
    CqrsModule,
  ],
  providers: [
    NotificationService,
    OutboxProcessorService,
    EmailService,
    SmsService,
    CalendarService,
    ReminderSchedulerService,
    ...EventHandlers,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
