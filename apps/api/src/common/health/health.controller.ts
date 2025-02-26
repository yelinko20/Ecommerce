import * as os from 'os';
import * as path from 'path';
import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { DrizzleHealthIndicator } from './indicators/drizzle.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private drizzleIndicator: DrizzleHealthIndicator,
    private redisIndicator: RedisHealthIndicator,
    private memoryIndicator: MemoryHealthIndicator,
    private diskIndicator: DiskHealthIndicator,
  ) {}

  private getRootPath(): string {
    return os.platform() === 'win32'
      ? `${process.cwd().split(path.sep)[0]}:\\`
      : '/';
  }

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => this.drizzleIndicator.pingCheck('database'),
      async () => this.redisIndicator.isHealthy('redis'),
      async () =>
        this.memoryIndicator.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () =>
        this.memoryIndicator.checkRSS('memory_rss', 500 * 1024 * 1024),
      async () =>
        this.diskIndicator.checkStorage('disk', {
          thresholdPercent: 0.85,
          path: this.getRootPath(),
        }),
    ]);
  }
}
