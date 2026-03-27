import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboxEvent } from './outbox-event.entity';
import { NotificationService } from './notification.service';
import { OutboxProcessorService } from './outbox-processor.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { CalendarService } from './channels/calendar.service';
import { ReminderSchedulerService } from './scheduler/reminder-scheduler.service';
import { Booking } from '../booking/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent, Booking])],
  providers: [
    NotificationService,
    OutboxProcessorService,
    EmailService,
    SmsService,
    CalendarService,
    ReminderSchedulerService,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
