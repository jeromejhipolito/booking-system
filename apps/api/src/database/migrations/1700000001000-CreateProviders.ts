import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProviders1700000001000 implements MigrationInterface {
  name = 'CreateProviders1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        business_name VARCHAR(255) NOT NULL,
        description TEXT,
        phone VARCHAR(20),
        address VARCHAR(500),
        timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
        settings JSONB NOT NULL DEFAULT '{"slotDurationMinutes":60,"bufferMinutes":15,"maxAdvanceDays":90,"minAdvanceHours":2,"maxBookingsPerSlot":1,"cancellationPolicyHours":24,"autoConfirm":true}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS providers CASCADE`);
  }
}
