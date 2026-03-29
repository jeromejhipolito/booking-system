import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WebhookSubscription } from './webhook-subscription.entity';

@Entity('webhook_deliveries')
export class WebhookDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'subscription_id' })
  subscriptionId: string;

  @ManyToOne(() => WebhookSubscription)
  @JoinColumn({ name: 'subscription_id' })
  subscription: WebhookSubscription;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column({ name: 'status_code', nullable: true })
  statusCode: number;

  @Column({ name: 'response_body', type: 'text', nullable: true })
  responseBody: string;

  @Column({ name: 'attempt_count', default: 0 })
  attemptCount: number;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'failed_at', type: 'timestamptz', nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
