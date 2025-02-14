import { registerAs } from '@nestjs/config';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { QueueConfig } from './queue-config.types';
import validateConfig from '@/shared/utils/validate-config';

/**
 * Validates and enforces the structure of queue-related environment variables.
 *
 * Example usage in `.env` file
 * ```env
 * REDIS_HOST=localhost
 * REDIS_PORT=6379
 * ```
 */
class QueueEnvValidator {
  /** The hostname or IP address of the Redis server. */
  @IsString()
  @IsOptional()
  REDIS_HOST?: string;

  /** The port number on which the Redis server is running. */
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;
}

export default registerAs<QueueConfig>('queue', () => {
  const env = validateConfig(process.env, QueueEnvValidator);

  return {
    host: env.REDIS_HOST || 'localhost',
    port: env.REDIS_PORT ? parseInt(env.REDIS_PORT.toString(), 10) : 6379,
    url: env.REDIS_URL,
  };
});
