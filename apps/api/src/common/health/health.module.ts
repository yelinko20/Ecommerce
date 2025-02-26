import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DrizzleHealthIndicator } from './indicators/drizzle.indicator';
import { RedisHealthIndicator } from './indicators/redis.indicator';
import { TerminusModule } from '@nestjs/terminus';
import { RedisService } from './services/redis.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [DrizzleHealthIndicator, RedisHealthIndicator, RedisService],
})
export class HealthModule {}
