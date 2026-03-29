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

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Bootstrap');
  logger.log(`API running on http://localhost:${port}/v1 (Fastify)`);
  logger.log(`Swagger docs: http://localhost:${port}/api-docs`);
}

bootstrap();
