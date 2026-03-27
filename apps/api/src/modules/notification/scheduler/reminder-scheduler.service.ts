import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, Not, In } from 'typeorm';
import { Booking } from '../../booking/booking.entity';
import { NotificationService } from '../notification.service';

@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger(ReminderSchedulerService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Run every hour to check for upcoming bookings that need reminders.
   * Sends reminders for bookings happening in the next 24 hours.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkUpcomingBookings() {
    this.logger.log('Checking for upcoming bookings to send reminders...');

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyThreeHoursFromNow = new Date(now.getTime() + 23 * 60 * 60 * 1000);

    try {
      // Find bookings starting in roughly 24 hours (within a 1-hour window)
      const upcomingBookings = await this.bookingRepo.find({
        where: {
          startTime: MoreThan(twentyThreeHoursFromNow),
          status: Not(In(['cancelled', 'completed'])),
        },
        relations: ['customer', 'service', 'provider'],
      });

      // Filter to only those within the 24-hour window
      const bookingsToRemind = upcomingBookings.filter(
        (b) => new Date(b.startTime) <= twentyFourHoursFromNow,
      );

      for (const booking of bookingsToRemind) {
        // Check if reminder already sent (stored in metadata)
        if (booking.metadata?.reminderSent) {
          continue;
        }

        await this.notificationService.queueEvent('booking.reminder', {
          bookingId: booking.id,
          customerEmail: booking.customer?.email,
          customerPhone: booking.customer?.phone,
          startTime: booking.startTime,
          serviceName: booking.service?.name,
          providerName: booking.provider?.businessName,
        });

        // Mark reminder as sent
        booking.metadata = { ...booking.metadata, reminderSent: true };
        await this.bookingRepo.save(booking);

        this.logger.log(`Reminder queued for booking ${booking.id}`);
      }

      if (bookingsToRemind.length > 0) {
        this.logger.log(`Queued ${bookingsToRemind.length} reminders`);
      }
    } catch (error) {
      this.logger.error(`Reminder scheduler error: ${error}`);
    }
  }
}
