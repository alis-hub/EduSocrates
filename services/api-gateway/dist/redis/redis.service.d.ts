export declare class RedisService {
    private readonly redis;
    constructor(redis: any);
    checkAndIncrementQuota(key: string, windowMs: number, limit: number): Promise<void>;
    private memoryQuotaCheck;
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
}
