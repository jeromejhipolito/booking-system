import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookIngestedEvents1700000010000 implements MigrationInterface {
  name = 'CreateWebhookIngestedEvents1700000010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE webhook_ingested_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source VARCHAR(100) NOT NULL,
        external_event_id VARCHAR(255),
        event_type VARCHAR(100) NOT NULL,
        payload JSONB NOT NULL,
        signature_valid BOOLEAN NOT NULL DEFAULT true,
        processed BOOLEAN DEFAULT false,
        processed_at TIMESTAMPTZ,
        error TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_webhook_ingest_idempotency
      ON webhook_ingested_events(source, external_event_id)
      WHERE external_event_id IS NOT NULL
    `);
    await queryRunner.query(`
      CREATE INDEX idx_webhook_ingest_unprocessed
      ON webhook_ingested_events(processed, created_at)
      WHERE processed = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS webhook_ingested_events CASCADE`);
  }
}
