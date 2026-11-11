import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RedisModule } from '../redis/redis.module';
import { AiProxyModule } from '../ai-proxy/ai-proxy.module';
import { AuthModule } from '../auth/auth.module';
import { HubService } from './hub.service';
import { HubController } from './hub.controller';

@Module({
  imports: [DatabaseModule, RedisModule, AiProxyModule, AuthModule],
  controllers: [HubController],
  providers: [HubService],
  exports: [HubService],
})
export class HubModule {}
