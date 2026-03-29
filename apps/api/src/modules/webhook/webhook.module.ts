import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { WebhookSubscription } from './webhook-subscription.entity';
import { WebhookDelivery } from './webhook-delivery.entity';
import { WebhookIngestedEvent } from './inbound/webhook-ingested-event.entity';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
import { WebhookDeliveryProcessor } from './processors/webhook-delivery.processor';
import { WebhookIngestController } from './inbound/webhook-ingest.controller';
import {
  WebhookBookingConfirmedHandler,
  WebhookBookingCancelledHandler,
  WebhookBookingRescheduledHandler,
} from './handlers/webhook-dispatch.handler';

const EventHandlers = [
  WebhookBookingConfirmedHandler,
  WebhookBookingCancelledHandler,
  WebhookBookingRescheduledHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookSubscription, WebhookDelivery, WebhookIngestedEvent]),
    CqrsModule,
    BullModule.registerQueue({ name: 'webhooks' }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [WebhookController, WebhookIngestController],
  providers: [
    WebhookService,
    WebhookDeliveryProcessor,
    ...EventHandlers,
  ],
  exports: [WebhookService],
})
export class WebhookModule {}
