import { Inject, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/drizzle/schema/index';
import { DATABASE_CONNECTION } from './database-connection';

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        try {
          const pool = new Pool({
            connectionString: configService.getOrThrow('DATABASE_URL'),
            max: 10,
            idleTimeoutMillis: 30000,
          });

          const db = drizzle(pool, {
            schema: { schema },
            logger: true,
          });

          console.log('Database connection initialized successfully.');
          return db;
        } catch (error) {
          console.error('Failed to initialize database connection:', error);
          throw new Error('Database connection setup failed.');
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DrizzleModule {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: ReturnType<typeof drizzle>,
  ) {}

  async onModuleDestroy() {
    const pool = this.db.$client as Pool;
    console.log('Closing database connection pool...');
    await pool.end();
  }
}
