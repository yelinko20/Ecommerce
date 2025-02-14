export interface AppConfig {
  /** The environment in which the application is running */
  nodeEnv: string;

  /** Application name, typically used in logs and monitoring */
  name: string;

  /** The domain for frontend access, optional */
  frontendDomain?: string;

  /** The backend domain required for API interactions */
  backendDomain: string;

  /** Port number on which the server listens */
  port: number;

  /** API prefix used for versioning and routing */
  apiPrefix: string;
}
