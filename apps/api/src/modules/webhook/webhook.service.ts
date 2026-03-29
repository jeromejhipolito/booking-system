import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHmac } from 'crypto';
import { WebhookSubscription } from './webhook-subscription.entity';
import { WebhookDelivery } from './webhook-delivery.entity';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookSubscription)
    private readonly subscriptionRepo: Repository<WebhookSubscription>,
    @InjectRepository(WebhookDelivery)
    private readonly deliveryRepo: Repository<WebhookDelivery>,
  ) {}

  async createSubscription(providerId: string, url: string, eventTypes: string[]): Promise<WebhookSubscription & { secret: string }> {
    const secret = randomBytes(32).toString('hex');
    const subscription = this.subscriptionRepo.create({
      providerId,
      url,
      secret,
      eventTypes,
      isActive: true,
    });
    const saved = await this.subscriptionRepo.save(subscription);
    return { ...saved, secret }; // Return secret on creation only
  }

  async listSubscriptions(providerId: string): Promise<Omit<WebhookSubscription, 'secret'>[]> {
    const subs = await this.subscriptionRepo.find({
      where: { providerId },
      order: { createdAt: 'DESC' },
    });
    return subs.map(({ secret, ...rest }) => rest as any);
  }

  async deactivateSubscription(id: string, providerId: string): Promise<void> {
    await this.subscriptionRepo.update({ id, providerId }, { isActive: false });
  }

  async findActiveByProviderAndEvent(providerId: string, eventType: string): Promise<WebhookSubscription[]> {
    const subs = await this.subscriptionRepo.find({
      where: { providerId, isActive: true },
    });
    return subs.filter((s) => s.eventTypes.includes(eventType));
  }

  async createDelivery(subscription: WebhookSubscription, eventType: string, payload: Record<string, any>): Promise<WebhookDelivery> {
    const delivery = this.deliveryRepo.create({
      subscriptionId: subscription.id,
      eventType,
      payload,
    });
    return this.deliveryRepo.save(delivery);
  }

  async getDeliveryWithSubscription(deliveryId: string): Promise<WebhookDelivery> {
    return this.deliveryRepo.findOneOrFail({
      where: { id: deliveryId },
      relations: ['subscription'],
    });
  }

  async recordDeliveryResult(deliveryId: string, statusCode: number, responseBody: string, error?: string): Promise<void> {
    const update: any = {
      statusCode,
      responseBody: responseBody?.substring(0, 2000),
      attemptCount: () => 'attempt_count + 1',
    };

    if (statusCode >= 200 && statusCode < 300) {
      update.deliveredAt = new Date();
    } else {
      update.failedAt = new Date();
      update.error = error || `HTTP ${statusCode}`;
    }

    await this.deliveryRepo.update(deliveryId, update);
  }

  async listDeliveries(providerId: string, limit = 20): Promise<WebhookDelivery[]> {
    return this.deliveryRepo
      .createQueryBuilder('d')
      .innerJoin('d.subscription', 's')
      .where('s.provider_id = :providerId', { providerId })
      .orderBy('d.created_at', 'DESC')
      .limit(limit)
      .getMany();
  }

  signPayload(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }
}
