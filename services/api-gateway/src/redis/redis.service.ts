import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';

// Simple in-memory fallback store for environments without Redis
const memoryStore = new Map<string, { count: number; windowStart: number }>();

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: any) {}

  /**
   * Atomic sliding-window rate limiter using Redis INCR + EXPIRE.
   * Throws 429 if limit exceeded. Falls back to in-memory if Redis unavailable.
   */
  async checkAndIncrementQuota(
    key: string,
    windowMs: number,
    limit: number,
  ): Promise<void> {
    const canonicalKey = key.startsWith('quota:') ? key : `quota:${key}`;
    try {
      const count = await this.redis.incr(canonicalKey);
      if (count === 1) {
        // First request in this window — set TTL
        await this.redis.pexpire(canonicalKey, windowMs);
      }
      if (count > limit) {
        throw new HttpException(
          `AI query quota exceeded (${limit} per hour). Please try again later.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    } catch (err: any) {
      if (err?.status === HttpStatus.TOO_MANY_REQUESTS) throw err;
      // Redis unavailable — use in-memory fallback
      this.memoryQuotaCheck(canonicalKey, windowMs, limit);
    }
  }

  private memoryQuotaCheck(key: string, windowMs: number, limit: number) {
    const now = Date.now();
    const entry = memoryStore.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      memoryStore.set(key, { count: 1, windowStart: now });
      return;
    }
    if (entry.count >= limit) {
      throw new HttpException(
        `AI query quota exceeded (${limit} per hour). Please try again later.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    entry.count += 1;
  }

  /** Generic get with JSON parse. */
  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await this.redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }

  /** Generic set with optional TTL in seconds. */
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch {
      // Silently fail — Redis unavailable
    }
  }

  /** Delete a key. */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {
      // Silently fail
    }
  }
}

