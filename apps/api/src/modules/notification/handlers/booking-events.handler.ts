import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { NotificationService } from '../notification.service';
import { BookingConfirmedEvent } from '../../booking/events/booking-confirmed.event';
import { BookingCancelledEvent } from '../../booking/events/booking-cancelled.event';
import { BookingRescheduledEvent } from '../../booking/events/booking-rescheduled.event';

@EventsHandler(BookingConfirmedEvent)
export class BookingConfirmedHandler implements IEventHandler<BookingConfirmedEvent> {
  private readonly logger = new Logger(BookingConfirmedHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingConfirmedEvent) {
    this.logger.log(`Booking confirmed: ${event.bookingId} — queueing notification`);
    await this.notificationService.queueEvent('booking.confirmed', {
      bookingId: event.bookingId,
      serviceId: event.serviceId,
      providerId: event.providerId,
      customerId: event.customerId,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      customerEmail: event.customerEmail,
      accessToken: event.accessToken,
    });
  }
}

@EventsHandler(BookingCancelledEvent)
export class BookingCancelledHandler implements IEventHandler<BookingCancelledEvent> {
  private readonly logger = new Logger(BookingCancelledHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCancelledEvent) {
    this.logger.log(`Booking cancelled: ${event.bookingId} — queueing notification`);
    await this.notificationService.queueEvent('booking.cancelled', {
      bookingId: event.bookingId,
      providerId: event.providerId,
      customerId: event.customerId,
      reason: event.reason,
    });
  }
}

@EventsHandler(BookingRescheduledEvent)
export class BookingRescheduledHandler implements IEventHandler<BookingRescheduledEvent> {
  private readonly logger = new Logger(BookingRescheduledHandler.name);

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingRescheduledEvent) {
    this.logger.log(`Booking rescheduled: ${event.oldBookingId} → ${event.newBookingId} — queueing notification`);
    await this.notificationService.queueEvent('booking.rescheduled', {
      oldBookingId: event.oldBookingId,
      newBookingId: event.newBookingId,
      providerId: event.providerId,
      customerId: event.customerId,
      newStartTime: event.newStartTime.toISOString(),
      newEndTime: event.newEndTime.toISOString(),
    });
  }
}
