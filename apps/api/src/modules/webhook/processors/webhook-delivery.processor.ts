import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { WebhookService } from '../webhook.service';

export interface WebhookDeliveryJobData {
  deliveryId: string;
}

@Processor('webhooks', {
  concurrency: 3,
})
export class WebhookDeliveryProcessor extends WorkerHost {
  private readonly logger = new Logger(WebhookDeliveryProcessor.name);

  constructor(private readonly webhookService: WebhookService) {
    super();
  }

  async process(job: Job<WebhookDeliveryJobData>): Promise<void> {
    const { deliveryId } = job.data;

    this.logger.log(
      `Delivering webhook ${deliveryId} (attempt ${job.attemptsMade + 1})`,
    );

    const delivery = await this.webhookService.getDeliveryWithSubscription(deliveryId);
    const subscription = delivery.subscription;

    const payloadStr = JSON.stringify(delivery.payload);
    const signature = this.webhookService.signPayload(payloadStr, subscription.secret);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': delivery.eventType,
          'X-Webhook-Delivery-Id': delivery.id,
        },
        body: payloadStr,
        signal: controller.signal,
      });

      const responseText = await response.text().catch(() => '');

      await this.webhookService.recordDeliveryResult(
        deliveryId,
        response.status,
        responseText,
      );

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: HTTP ${response.status}`);
      }

      this.logger.log(`Webhook ${deliveryId} delivered: ${response.status}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
