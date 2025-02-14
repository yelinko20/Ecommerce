import { registerAs } from '@nestjs/config';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import { AppConfig } from './app-config.types';
import validateConfig from '@/shared/utils/validate-config';

/**
 * Defines the supported environment modes for the application.
 *
 * - `'development'` - Used during development.
 * - `'production'` - Used in a live environment.
 * - `'test'` - Used for running test cases.
 */
enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}
/**
 * Validates and enforces the structure of application environment variables.
 *
 * Example usage in `.env` file:
 * ```env
 * NODE_ENV=production
 * APP_PORT=3000
 * FRONTEND_DOMAIN=https://example.com
 * BACKEND_DOMAIN=https://api.example.com
 * API_PREFIX=/api/v1
 * ```
 */
class AppEnvValidator {
  /** Defines the environment mode: development, production, or test. */
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV?: Environment;

  /** The port on which the application runs. */
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT?: number;

  /** The frontend application domain URL. */
  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN?: string;

  /** The backend API domain URL. */
  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN?: string;

  /** The API prefix for routing. */
  @IsString()
  @IsOptional()
  API_PREFIX?: string;
}

export default registerAs<AppConfig>('app', () => {
  const env = validateConfig(process.env, AppEnvValidator);

  return {
    nodeEnv: env.NODE_ENV,
    name: process.env.APP_NAME || 'Ye Dev',
    frontendDomain: env.FRONTEND_DOMAIN,
    backendDomain: env.BACKEND_DOMAIN,
    port: env.APP_PORT ? parseInt(env.APP_PORT.toString(), 10) : 3000,
    apiPrefix: env.API_PREFIX || 'api',
  };
});
