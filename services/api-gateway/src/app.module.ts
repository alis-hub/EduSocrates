import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CourseworkModule } from './coursework/coursework.module';
import { AiProxyModule } from './ai-proxy/ai-proxy.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { RedisModule } from './redis/redis.module';
import { ParentModule } from './parent/parent.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    DatabaseModule,
    AuthModule,
    AdminModule,
    CourseworkModule,
    AiProxyModule,
    SuperAdminModule,
    ParentModule,
  ],
})
export class AppModule {}

