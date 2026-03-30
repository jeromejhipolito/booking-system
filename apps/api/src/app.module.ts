import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { UserModule } from './modules/user/user.module';
import { ProviderModule } from './modules/provider/provider.module';
import { ServiceModule } from './modules/service/service.module';
import { CustomerModule } from './modules/customer/customer.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingModule } from './modules/booking/booking.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './health/health.module';
import { ReviewModule } from './modules/review/review.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          genReqId: (req: any) => req.headers['x-request-id'] || randomUUID(),
          transport: config.get('NODE_ENV') !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
            : undefined,
          customProps: () => ({ service: 'booking-api' }),
          serializers: {
            req: (req: any) => ({ method: req.method, url: req.url, id: req.id }),
            res: (res: any) => ({ statusCode: res.statusCode }),
          },
          autoLogging: {
            ignore: (req: any) => req.url === '/v1/health',
          },
        },
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get('DATABASE_USER', 'booking_user'),
        password: config.get('DATABASE_PASSWORD', 'booking_pass'),
        database: config.get('DATABASE_NAME', 'booking_system'),
        autoLoadEntities: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => [{
        ttl: 60000,
        limit: parseInt(process.env.THROTTLE_LIMIT || '100'),
      }],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'notifications' },
      { name: 'webhooks' },
    ),
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    UserModule,
    ProviderModule,
    ServiceModule,
    CustomerModule,
    AvailabilityModule,
    BookingModule,
    NotificationModule,
    ReviewModule,
    WebhookModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
