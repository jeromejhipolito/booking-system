import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { WebhookService } from '../webhook.service';
import { BookingConfirmedEvent } from '../../booking/events/booking-confirmed.event';
import { BookingCancelledEvent } from '../../booking/events/booking-cancelled.event';
import { BookingRescheduledEvent } from '../../booking/events/booking-rescheduled.event';
import type { WebhookDeliveryJobData } from '../processors/webhook-delivery.processor';

async function dispatchWebhooks(
  service: WebhookService,
  queue: Queue<WebhookDeliveryJobData>,
  logger: Logger,
  providerId: string,
  eventType: string,
  payload: Record<string, any>,
) {
  const subscriptions = await service.findActiveByProviderAndEvent(providerId, eventType);

  for (const sub of subscriptions) {
    const delivery = await service.createDelivery(sub, eventType, payload);
    await queue.add('deliver', { deliveryId: delivery.id }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 60000 },
      removeOnComplete: { count: 500 },
      removeOnFail: { count: 2000 },
    });
    logger.log(`Webhook queued: ${eventType} → ${sub.url} (delivery: ${delivery.id})`);
  }
}

@EventsHandler(BookingConfirmedEvent)
export class WebhookBookingConfirmedHandler implements IEventHandler<BookingConfirmedEvent> {
  private readonly logger = new Logger('WebhookDispatch');

  constructor(
    private readonly webhookService: WebhookService,
    @InjectQueue('webhooks') private readonly webhooksQueue: Queue<WebhookDeliveryJobData>,
  ) {}

  async handle(event: BookingConfirmedEvent) {
    await dispatchWebhooks(this.webhookService, this.webhooksQueue, this.logger, event.providerId, 'booking.confirmed', {
      bookingId: event.bookingId,
      serviceId: event.serviceId,
      providerId: event.providerId,
      customerId: event.customerId,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      customerEmail: event.customerEmail,
    });
  }
}

@EventsHandler(BookingCancelledEvent)
export class WebhookBookingCancelledHandler implements IEventHandler<BookingCancelledEvent> {
  private readonly logger = new Logger('WebhookDispatch');

  constructor(
    private readonly webhookService: WebhookService,
    @InjectQueue('webhooks') private readonly webhooksQueue: Queue<WebhookDeliveryJobData>,
  ) {}

  async handle(event: BookingCancelledEvent) {
    await dispatchWebhooks(this.webhookService, this.webhooksQueue, this.logger, event.providerId, 'booking.cancelled', {
      bookingId: event.bookingId,
      providerId: event.providerId,
      customerId: event.customerId,
      reason: event.reason,
    });
  }
}

@EventsHandler(BookingRescheduledEvent)
export class WebhookBookingRescheduledHandler implements IEventHandler<BookingRescheduledEvent> {
  private readonly logger = new Logger('WebhookDispatch');

  constructor(
    private readonly webhookService: WebhookService,
    @InjectQueue('webhooks') private readonly webhooksQueue: Queue<WebhookDeliveryJobData>,
  ) {}

  async handle(event: BookingRescheduledEvent) {
    await dispatchWebhooks(this.webhookService, this.webhooksQueue, this.logger, event.providerId, 'booking.rescheduled', {
      oldBookingId: event.oldBookingId,
      newBookingId: event.newBookingId,
      providerId: event.providerId,
      customerId: event.customerId,
      newStartTime: event.newStartTime.toISOString(),
      newEndTime: event.newEndTime.toISOString(),
    });
  }
}
