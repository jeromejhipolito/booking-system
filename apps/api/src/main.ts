import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  // Use Pino logger from nestjs-pino if available
  try {
    const { Logger: PinoLogger } = await import('nestjs-pino');
    app.useLogger(app.get(PinoLogger));
  } catch {
    // Falls back to default logger if nestjs-pino not configured
  }

  // Security headers via @fastify/helmet
  await app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: false, // Disable CSP for Swagger UI
  });

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  });

  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // OpenAPI/Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BookIt API')
    .setDescription('Service booking platform with reliable event processing')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // Bull Board — queue monitoring dashboard
  // NOTE: Disabled until @bull-board/fastify supports Fastify 4
  // The @fastify/static dependency requires Fastify 5.
  // Re-enable when upgrading to Fastify 5 or use @bull-board/express adapter.
  /*
  try {
    const { createBullBoard } = await import('@bull-board/api');
    const { BullMQAdapter } = await import('@bull-board/api/bullMQAdapter');
    const { FastifyAdapter: BullFastifyAdapter } = await import('@bull-board/fastify');
    const { getQueueToken } = await import('@nestjs/bullmq');

    const serverAdapter = new BullFastifyAdapter();
    serverAdapter.setBasePath('/admin/queues');

    const queues: any[] = [];
    for (const name of ['notifications', 'webhooks']) {
      try {
        const queue = app.get(getQueueToken(name));
        queues.push(new BullMQAdapter(queue));
      } catch {}
    }

    createBullBoard({ queues, serverAdapter });
    await app.register(serverAdapter.registerPlugin() as any, { prefix: '/admin/queues' });
  } catch (err: any) {
    // Bull Board is optional
  }
  */

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}/v1 (Fastify)`);
  logger.log(`Swagger docs: http://localhost:${port}/api-docs`);
  logger.log(`Queue dashboard: http://localhost:${port}/admin/queues`);
}

bootstrap();
