import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendBookingReminder(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `[SMS] Booking reminder sent for booking ${payload.bookingId} to ${payload.customerPhone || 'N/A'}`,
    );
    // In production: integrate with Twilio, etc.
    // await this.twilioClient.messages.create({
    //   body: `Reminder: You have a booking at ${payload.startTime}`,
    //   to: payload.customerPhone,
    //   from: this.fromNumber,
    // });
  }

  async sendBookingConfirmation(payload: Record<string, any>): Promise<void> {
    this.logger.log(
      `[SMS] Booking confirmation sent for booking ${payload.bookingId}`,
    );
  }
}
