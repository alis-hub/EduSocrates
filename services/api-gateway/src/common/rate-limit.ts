import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../redis/redis.service';

export const RATE_LIMIT_KEY = 'rate_limit';
export interface RateLimitOptions {
  /** logical bucket name, e.g. "login" */
  name: string;
  limit: number;
  windowMs: number;
}

/** Per-client-IP rate limit for a route. Use together with @UseGuards(RateLimitGuard). */
export const RateLimit = (opts: RateLimitOptions) => SetMetadata(RATE_LIMIT_KEY, opts);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redis: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const opts = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!opts) return true;
    const req = context.switchToHttp().getRequest();
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    await this.redis.checkAndIncrementQuota(
      `rl:${opts.name}:${ip}`,
      opts.windowMs,
      opts.limit,
      'Too many requests. Please slow down and try again later.',
    );
    return true;
  }
}
