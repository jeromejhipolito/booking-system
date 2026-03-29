import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookSubscriptions1700000008000 implements MigrationInterface {
  name = 'CreateWebhookSubscriptions1700000008000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE webhook_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        url VARCHAR(2048) NOT NULL,
        secret VARCHAR(255) NOT NULL,
        event_types TEXT[] NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_webhook_subs_provider ON webhook_subscriptions(provider_id, is_active)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS webhook_subscriptions CASCADE`);
  }
}
