import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const { default: Redis } = await import('ioredis');
        const redisUrl = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        const client = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
        });
        await client.connect().catch(() => {
          // Non-fatal: app works without Redis (falls back gracefully)
          console.warn('[Redis] Could not connect — quota will use in-memory fallback');
        });
        return client;
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}

