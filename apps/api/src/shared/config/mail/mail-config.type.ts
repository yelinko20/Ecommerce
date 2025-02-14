/**
 * Defines supported encryption methods for secure email communication.
 *
 * - `'TLS'` (Recommended) - Encrypts the connection using Transport Layer Security.
 * - `'SSL'` - Uses Secure Sockets Layer encryption (deprecated in favor of TLS).
 * - `'STARTTLS'` - Upgrades an unencrypted connection to a secure one.
 * - `'NONE'` - No encryption (not recommended for production use).
 */
export type MailEncryption = 'TLS' | 'SSL' | 'STARTTLS' | 'NONE';

/**
 * Authentication credentials required for SMTP authentication.
 *
 * Some SMTP servers support OAuth-based authentication, which may require
 * a token instead of a password.
 */
export interface MailAuth {
  /** SMTP username (typically an email address). */
  user: string;
  /** SMTP password or API token (ensure this is securely stored). */
  password: string;
}

/**
 * Represents the sender details for outgoing emails.
 *
 * This information is used in the "From" field of the email header.
 */
export interface MailSender {
  /** The email address of the sender (must be a valid email). */
  email: string;
  /** Optional sender name that appears alongside the email address. */
  name?: string;
}

/**
 * Configuration options for setting up an email client.
 *
 * Example Usage:
 * ```ts
 * const config: MailConfig = {
 *   host: "smtp.example.com",
 *   port: 587,
 *   auth: { user: "your-email@example.com", password: "secure-password" },
 *   from: { email: "no-reply@example.com", name: "Example App" },
 *   encryption: "STARTTLS",
 *   secure: false,
 *   connectionTimeout: 10000,
 *   pool: true,
 *   maxConnections: 5,
 * };
 * ```
 */
export interface MailConfig {
  /** The SMTP server hostname (e.g., smtp.example.com). */
  host: string;

  /** The SMTP port number (common values: 465 for SSL, 587 for TLS, 25 for unencrypted). */
  port: number;

  /** Optional authentication credentials. If omitted, the server may allow unauthenticated emails. */
  auth?: MailAuth;

  /** Default sender details, used if no specific "From" address is provided in individual emails. */
  from?: MailSender;

  /** Encryption method for securing email transmission (defaults to "TLS"). */
  encryption?: MailEncryption;

  /** Whether to use a secure connection (should be `true` for TLS/SSL ports like 465). */
  secure?: boolean;

  /** Timeout for establishing an SMTP connection, in milliseconds. */
  connectionTimeout?: number;

  /** Whether to enable connection pooling for performance optimization. */
  pool?: boolean;

  /** Maximum number of concurrent SMTP connections when using pooling. */
  maxConnections?: number;

  /**
   * Whether to enforce the use of STARTTLS when connecting to the SMTP server.
   * - If `true`, the connection will fail if STARTTLS is not supported.
   * - If `false`, the client may connect without encryption if STARTTLS is unavailable.
   *
   * Recommended to set `true` for security when using SMTP over port 587.
   */
  requireTLS?: boolean;

  /**
   * Default values for configuration.
   *
   * This can be used to provide fallback settings that individual emails can override.
   */
  defaults?: Partial<MailConfig>;
}

/**
 * A stricter mail configuration type where authentication is mandatory.
 *
 * Use this type when authentication is required for all email transactions.
 */
export type MailConfigWithAuth = MailConfig & { auth: MailAuth };

/**
 * A strict version of `MailConfig` where all fields are required.
 *
 * This is useful for scenarios where default values must be explicitly set.
 */
export type MailConfigStrict = Required<MailConfig>;
