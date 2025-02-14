import { Pool } from 'pg';
import { Inject, Module, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';

import * as schema from '@/drizzle/schema/index';
import { DATABASE_CONNECTION } from './database-connection';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('DrizzleModule');

        try {
          logger.log('🚀 Initializing database connection...');

          const pool = new Pool({
            connectionString: configService.getOrThrow('DATABASE_URL'),
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
          });

          const db = drizzle(pool, {
            schema: { schema },
            logger: process.env.NODE_ENV !== 'production',
          });

          logger.log('✅ Database connection initialized successfully.');
          return db;
        } catch (error) {
          logger.error('❌ Failed to initialize database connection', error);
          throw new Error('Database connection setup failed.');
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DrizzleModule implements OnModuleDestroy {
  private readonly logger = new Logger(DrizzleModule.name);

  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: ReturnType<typeof drizzle>,
  ) {}

  async onModuleDestroy() {
    this.logger.warn('🛑 Closing database connection pool...');
    try {
      const pool = this.db.$client as Pool;
      await pool.end();
      this.logger.log('✅ Database connection pool closed.');
    } catch (error) {
      this.logger.error('❌ Error closing database connection pool', error);
    }
  }
}
