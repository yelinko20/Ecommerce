import { registerAs } from '@nestjs/config';
import {
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsBoolean,
  IsEmail,
} from 'class-validator';
import { MailConfig, MailEncryption } from './mail-config.type';
import validateConfig from '@/shared/utils/validate-config';

/**
 * Validates and enforces environment variable structure for mail configuration.
 */
class MailEnvValidator {
  /** SMTP server hostname (e.g., smtp.example.com) */
  @IsString()
  SMTP_HOST: string;

  /** SMTP port number (465 for SSL, 587 for STARTTLS, 25 for unencrypted) */
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  SMTP_PORT: number;

  /** SMTP authentication username (typically an email address) */
  @IsString()
  @IsOptional()
  SMTP_USER?: string;

  /** SMTP authentication password or API token */
  @IsString()
  @IsOptional()
  SMTP_PASSWORD?: string;

  /** Default sender email address */
  @IsEmail()
  SMTP_DEFAULT_SENDER_EMAIL: string;

  /** Default sender display name (optional) */
  @IsString()
  @IsOptional()
  SMTP_DEFAULT_SENDER_NAME?: string;

  /** Encryption method: TLS, SSL, STARTTLS, or NONE */
  @IsString()
  @IsOptional()
  SMTP_ENCRYPTION?: MailEncryption;

  /** Whether to enforce a secure connection */
  @IsBoolean()
  SMTP_SECURE: boolean;

  /** Whether to enforce STARTTLS (if false, it may allow plain connections) */
  @IsBoolean()
  @IsOptional()
  SMTP_REQUIRE_TLS?: boolean;

  /** Timeout for establishing SMTP connection (in milliseconds) */
  @IsInt()
  @Min(1000)
  @IsOptional()
  SMTP_CONNECTION_TIMEOUT?: number;

  /** Whether to enable connection pooling */
  @IsBoolean()
  @IsOptional()
  SMTP_POOL?: boolean;

  /** Maximum number of concurrent SMTP connections */
  @IsInt()
  @Min(1)
  @IsOptional()
  SMTP_MAX_CONNECTIONS?: number;
}

/**
 * Registers the mail configuration with validation.
 */
export default registerAs<MailConfig>('mail', () => {
  const env = validateConfig(process.env, MailEnvValidator);

  return {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? { user: env.SMTP_USER, password: env.SMTP_PASSWORD }
        : undefined,
    from: env.SMTP_DEFAULT_SENDER_EMAIL
      ? {
          email: env.SMTP_DEFAULT_SENDER_EMAIL,
          name: env.SMTP_DEFAULT_SENDER_NAME || 'No-Reply',
        }
      : undefined,
    encryption: (env.SMTP_ENCRYPTION as MailEncryption) || 'TLS',
    secure: env.SMTP_SECURE === true,
    requireTLS: env.SMTP_REQUIRE_TLS === true,
    connectionTimeout: env.SMTP_CONNECTION_TIMEOUT
      ? parseInt(env.SMTP_CONNECTION_TIMEOUT.toString(), 10)
      : 10000,
    pool: env.SMTP_POOL === true,
    maxConnections: env.SMTP_MAX_CONNECTIONS
      ? parseInt(env.SMTP_MAX_CONNECTIONS.toString(), 10)
      : 5,
  };
});
