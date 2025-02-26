import {
  promiseTimeout,
  TimeoutError as PromiseTimeoutError,
} from '@/shared/utils/promise-timeout';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export interface DrizzleClientPingCheckSetting {
  /**
   * The amount of time the check should require in ms
   */
  timeout?: number;
}

@Injectable()
export class DrizzleHealthIndicator {
  private static pool: Pool;
  private readonly db: NodePgDatabase;
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly configService: ConfigService,
  ) {
    if (!DrizzleHealthIndicator.pool) {
      DrizzleHealthIndicator.pool = new Pool({
        connectionString: this.configService.getOrThrow('DATABASE_URL'),
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    }
    this.db = drizzle(DrizzleHealthIndicator.pool);
  }

  private async pingDB(timeout: number) {
    try {
      await promiseTimeout(timeout, this.db.execute('SELECT 1'));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if Drizzle ORM responds within the given timeout
   * and returns a health indicator result.
   *
   * @param key The key which will be used for the result object
   * @param options The options for the ping
   */
  public async pingCheck<Key extends string = string>(
    key: Key,
    options: DrizzleClientPingCheckSetting = {},
  ): Promise<HealthIndicatorResult<Key>> {
    const check = this.healthIndicatorService.check(key);
    const timeout = options.timeout || 1000;

    try {
      await this.pingDB(timeout);
    } catch (error) {
      if (error instanceof PromiseTimeoutError) {
        return check.down(`Timeout of ${timeout}ms exceeded`);
      }
      return check.down();
    }
    return check.up();
  }
}
