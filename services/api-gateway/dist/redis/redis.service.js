"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const memoryStore = new Map();
let RedisService = class RedisService {
    redis;
    constructor(redis) {
        this.redis = redis;
    }
    async checkAndIncrementQuota(key, windowMs, limit) {
        const canonicalKey = key.startsWith('quota:') ? key : `quota:${key}`;
        try {
            const count = await this.redis.incr(canonicalKey);
            if (count === 1) {
                await this.redis.pexpire(canonicalKey, windowMs);
            }
            if (count > limit) {
                throw new common_1.HttpException(`AI query quota exceeded (${limit} per hour). Please try again later.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
        }
        catch (err) {
            if (err?.status === common_1.HttpStatus.TOO_MANY_REQUESTS)
                throw err;
            this.memoryQuotaCheck(canonicalKey, windowMs, limit);
        }
    }
    memoryQuotaCheck(key, windowMs, limit) {
        const now = Date.now();
        const entry = memoryStore.get(key);
        if (!entry || now - entry.windowStart > windowMs) {
            memoryStore.set(key, { count: 1, windowStart: now });
            return;
        }
        if (entry.count >= limit) {
            throw new common_1.HttpException(`AI query quota exceeded (${limit} per hour). Please try again later.`, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        entry.count += 1;
    }
    async get(key) {
        try {
            const val = await this.redis.get(key);
            return val ? JSON.parse(val) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.redis.setex(key, ttlSeconds, serialized);
            }
            else {
                await this.redis.set(key, serialized);
            }
        }
        catch {
        }
    }
    async del(key) {
        try {
            await this.redis.del(key);
        }
        catch {
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [Object])
], RedisService);
//# sourceMappingURL=redis.service.js.map