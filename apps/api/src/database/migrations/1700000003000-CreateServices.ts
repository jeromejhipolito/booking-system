import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServices1700000003000 implements MigrationInterface {
  name = 'CreateServices1700000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE service_type AS ENUM ('appointment', 'class', 'event', 'workshop');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        service_type service_type NOT NULL DEFAULT 'appointment',
        duration_minutes INTEGER NOT NULL DEFAULT 60,
        buffer_minutes INTEGER NOT NULL DEFAULT 15,
        price DECIMAL(10,2),
        currency VARCHAR(3) DEFAULT 'USD',
        max_participants INTEGER NOT NULL DEFAULT 1,
        is_active BOOLEAN NOT NULL DEFAULT true,
        config JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_services_provider_id ON services(provider_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS services CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS service_type`);
  }
}
