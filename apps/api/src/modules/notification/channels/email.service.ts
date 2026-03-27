import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendBookingConfirmation(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `[EMAIL] Booking confirmation sent for booking ${payload.bookingId} to ${payload.customerEmail}`,
    );
    // In production: integrate with SendGrid, SES, etc.
    // await this.mailer.send({
    //   to: payload.customerEmail,
    //   subject: 'Booking Confirmed',
    //   template: 'booking-confirmation',
    //   context: payload,
    // });
  }

  async sendBookingCancellation(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `[EMAIL] Booking cancellation sent for booking ${payload.bookingId}`,
    );
  }

  async sendBookingReschedule(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `[EMAIL] Booking reschedule notification sent for booking ${payload.newBookingId}`,
    );
  }

  async sendBookingReminder(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `[EMAIL] Booking reminder sent for booking ${payload.bookingId}`,
    );
  }
}
