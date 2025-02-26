import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';
import { RedisService } from '../services/redis.service';

@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    const start = performance.now();

    try {
      await this.redisService.ping();
      const duration = (performance.now() - start).toFixed(2);

      this.logger.log(`✅ Redis is healthy. Response time: ${duration}ms`);

      return indicator.up({ responseTime: `${duration}ms` });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown Redis error';

      this.logger.error(`❌ Redis check failed: ${errorMessage}`);

      return indicator.down({ error: errorMessage });
    }
  }
}
