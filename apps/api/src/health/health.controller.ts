import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { Public } from '../decorators/public.decorator';

@Controller('health')
export class HealthController {
  private readonly redis: Redis;

  constructor(private readonly dataSource: DataSource) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
    });
  }

  @Public()
  @Get()
  async check() {
    const uptime = process.uptime();
    let dbStatus = 'down';
    let redisStatus = 'down';

    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    try {
      await this.redis.ping();
      redisStatus = 'up';
    } catch {
      redisStatus = 'down';
    }

    const healthy = dbStatus === 'up';

    return {
      status: healthy ? 'healthy' : 'unhealthy',
      uptime: Math.round(uptime),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
