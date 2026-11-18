import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

import { DatabaseService, DATABASE_POOL, DATABASE_APP_POOL } from './database.service';

export { DATABASE_POOL, DATABASE_APP_POOL };

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new Pool({
          connectionString: config.get<string>('DATABASE_URL'),
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        }),
    },
    {
      provide: DATABASE_APP_POOL,
      inject: [ConfigService, DATABASE_POOL],
      useFactory: (config: ConfigService, systemPool: Pool) => {
        const appUrl = config.get<string>('DATABASE_APP_URL');
        if (!appUrl) {
          if (config.get<string>('NODE_ENV') === 'production') {
            throw new Error(
              'DATABASE_APP_URL (restricted, non-owner, non-BYPASSRLS role) is required in production.',
            );
          }
          new Logger('Database').warn(
            'DATABASE_APP_URL not set: tenant queries use the privileged pool, so Row-Level Security is NOT enforced. ' +
              'Apply database/migrations/004_sprint0_security.sql and set DATABASE_APP_URL.',
          );
          return systemPool;
        }
        return new Pool({
          connectionString: appUrl,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });
      },
    },
    DatabaseService,
  ],
  exports: [DATABASE_POOL, DATABASE_APP_POOL, DatabaseService],
})
export class DatabaseModule {}
