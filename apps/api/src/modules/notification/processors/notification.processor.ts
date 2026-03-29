import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification.service';
import { OutboxEvent } from '../outbox-event.entity';

export interface NotificationJobData {
  eventType: string;
  payload: Record<string, any>;
  outboxId: string;
}

@Processor('notifications', {
  concurrency: 5,
})
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
    @InjectRepository(OutboxEvent)
    private readonly outboxRepo: Repository<OutboxEvent>,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { eventType, payload, outboxId } = job.data;

    this.logger.log(
      `Processing notification job ${job.id}: ${eventType} (outbox: ${outboxId}, attempt: ${job.attemptsMade + 1})`,
    );

    // Build a minimal OutboxEvent for the notification service
    const event = new OutboxEvent();
    Object.assign(event, { id: outboxId, eventType, payload, processed: false, retryCount: 0 });

    await this.notificationService.processEvent(event);

    // Mark outbox event as processed
    await this.outboxRepo.update(outboxId, {
      processed: true,
      processedAt: new Date(),
    });

    this.logger.log(`Notification job ${job.id} completed: ${eventType}`);
  }
}
