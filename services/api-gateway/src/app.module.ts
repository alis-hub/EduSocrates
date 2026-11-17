import { Controller, Get, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SessionCookieInterceptor } from './common/session-cookie.interceptor';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CourseworkModule } from './coursework/coursework.module';
import { AiProxyModule } from './ai-proxy/ai-proxy.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { RedisModule } from './redis/redis.module';
import { ParentModule } from './parent/parent.module';
import { HubModule } from './hub/hub.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { EmailModule } from './email/email.module';

/** Lightweight liveness check for the hosting platform (no database access). */
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    EmailModule,
    DatabaseModule,
    AuthModule,
    AdminModule,
    CourseworkModule,
    AiProxyModule,
    SuperAdminModule,
    ParentModule,
    HubModule,
    OnboardingModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_INTERCEPTOR, useClass: SessionCookieInterceptor }],
})
export class AppModule {}

