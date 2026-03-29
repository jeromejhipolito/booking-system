import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { NotificationService } from './notification.service';
import { OutboxEvent } from './outbox-event.entity';

@Injectable()
export class OutboxProcessorService {
  private readonly logger = new Logger(OutboxProcessorService.name);
  private processing = false;

  constructor(
    private readonly dataSource: DataSource,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Sweep fallback: processes outbox events every 60 seconds.
   * Primary processing is via BullMQ; this catches anything BullMQ missed.
   * Uses SELECT FOR UPDATE SKIP LOCKED for safe concurrent processing.
   */
  @Cron('*/60 * * * * *')
  async processOutbox() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Select unprocessed events with FOR UPDATE SKIP LOCKED
        const events = await queryRunner.query(
          `SELECT * FROM outbox_events
           WHERE processed = false
           AND retry_count < 5
           ORDER BY created_at ASC
           LIMIT 10
           FOR UPDATE SKIP LOCKED`,
        );

        for (const eventRow of events) {
          const event = new OutboxEvent();
          Object.assign(event, {
            id: eventRow.id,
            eventType: eventRow.event_type,
            payload: eventRow.payload,
            processed: eventRow.processed,
            processedAt: eventRow.processed_at,
            error: eventRow.error,
            retryCount: eventRow.retry_count,
            createdAt: eventRow.created_at,
          });

          await this.notificationService.processEvent(event);
        }

        await queryRunner.commitTransaction();

        if (events.length > 0) {
          this.logger.log(`Processed ${events.length} outbox events`);
        }
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Outbox processing error: ${error}`);
      } finally {
        await queryRunner.release();
      }
    } finally {
      this.processing = false;
    }
  }
}
