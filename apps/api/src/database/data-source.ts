import { DataSource } from 'typeorm';

/**
 * TypeORM CLI data source — used by migration commands only.
 * The NestJS app uses TypeOrmModule.forRootAsync() in app.module.ts.
 *
 * Usage:
 *   pnpm migration:run      # build + apply pending migrations
 *   pnpm migration:revert   # build + rollback last migration
 *   pnpm migration:show     # build + list migration status
 */
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'booking_user',
  password: process.env.DATABASE_PASSWORD || 'booking_pass',
  database: process.env.DATABASE_NAME || 'booking_system',
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  logging: true,
});

export default AppDataSource;
