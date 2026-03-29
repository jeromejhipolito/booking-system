import { Controller, Post, Param, Req, Res, HttpCode, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHmac, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../../decorators/public.decorator';
import { WebhookIngestedEvent } from './webhook-ingested-event.entity';

@ApiTags('Webhooks - Inbound')
@Controller('webhooks/ingest')
export class WebhookIngestController {
  private readonly logger = new Logger(WebhookIngestController.name);

  constructor(
    @InjectRepository(WebhookIngestedEvent)
    private readonly ingestRepo: Repository<WebhookIngestedEvent>,
    @InjectQueue('notifications')
    private readonly processingQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post(':source')
  @HttpCode(202)
  async ingest(
    @Param('source') source: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    // Get raw body for signature verification
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    // Verify HMAC signature
    const signature = req.headers['x-webhook-signature'] as string;
    const secretEnv = `WEBHOOK_SECRET_${source.toUpperCase()}`;
    const secret = this.configService.get<string>(secretEnv, 'default-webhook-secret');

    if (signature) {
      const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
      try {
        const sigBuffer = Buffer.from(signature, 'utf8');
        const expectedBuffer = Buffer.from(expected, 'utf8');
        if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
          this.logger.warn(`Invalid webhook signature from ${source}`);
          throw new UnauthorizedException('Invalid webhook signature');
        }
      } catch (err: any) {
        if (err instanceof UnauthorizedException) throw err;
        throw new UnauthorizedException('Invalid webhook signature');
      }
    }

    const externalEventId = payload.id || req.headers['x-webhook-event-id'] || null;
    const eventType = payload.event_type || payload.type || req.headers['x-webhook-event'] || 'unknown';

    // Idempotency check
    if (externalEventId) {
      const existing = await this.ingestRepo.findOne({
        where: { source, externalEventId },
      });
      if (existing) {
        this.logger.log(`Duplicate webhook ignored: ${source}/${externalEventId}`);
        return res.status(200).send({ status: 'already_processed', id: existing.id });
      }
    }

    // Store the event
    const event = this.ingestRepo.create({
      source,
      externalEventId,
      eventType,
      payload,
      signatureValid: true,
    });
    const saved = await this.ingestRepo.save(event);

    // Dispatch for async processing
    await this.processingQueue.add(`ingest-${source}`, {
      ingestedEventId: saved.id,
      source,
      eventType,
      payload,
    });

    this.logger.log(`Webhook ingested: ${source}/${eventType} (${saved.id})`);
    return res.status(202).send({ status: 'accepted', id: saved.id });
  }
}
