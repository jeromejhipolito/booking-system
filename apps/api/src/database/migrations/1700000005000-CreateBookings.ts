import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookings1700000005000 implements MigrationInterface {
  name = 'CreateBookings1700000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // btree_gist is required for the EXCLUSION constraint
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS btree_gist`);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      CREATE TABLE bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
        provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        status booking_status NOT NULL DEFAULT 'confirmed',
        notes TEXT,
        cancellation_reason TEXT,
        idempotency_key VARCHAR(255),
        access_token VARCHAR(255),
        version INTEGER NOT NULL DEFAULT 1,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        EXCLUDE USING gist (
          provider_id WITH =,
          tstzrange(start_time, end_time) WITH &&
        ) WHERE (status NOT IN ('cancelled'))
      )
    `);
    await queryRunner.query(`CREATE INDEX idx_bookings_provider_id ON bookings(provider_id)`);
    await queryRunner.query(`CREATE INDEX idx_bookings_start_time ON bookings(start_time)`);
    await queryRunner.query(`CREATE INDEX idx_bookings_status ON bookings(status)`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_bookings_idempotency_key
      ON bookings(idempotency_key)
      WHERE idempotency_key IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS bookings CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS booking_status`);
  }
}
