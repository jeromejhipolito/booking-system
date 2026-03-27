import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check() {
    const uptime = process.uptime();
    let dbStatus = 'down';
    let redisStatus = 'unknown';

    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
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
