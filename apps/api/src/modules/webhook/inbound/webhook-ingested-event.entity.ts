import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhook_ingested_events')
export class WebhookIngestedEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  source: string;

  @Column({ name: 'external_event_id', length: 255, nullable: true })
  externalEventId: string;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column({ name: 'signature_valid', default: true })
  signatureValid: boolean;

  @Column({ default: false })
  processed: boolean;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
