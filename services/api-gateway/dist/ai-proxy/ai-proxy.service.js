"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiProxyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_service_1 = require("../database/database.service");
const redis_service_1 = require("../redis/redis.service");
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const QUOTA_LIMIT = 15;
const QUOTA_WINDOW_MS = 60 * 60 * 1000;
let AiProxyService = class AiProxyService {
    db;
    config;
    redisService;
    aiGatewayUrl;
    constructor(db, config, redisService) {
        this.db = db;
        this.config = config;
        this.redisService = redisService;
        this.aiGatewayUrl = config.get('AI_GATEWAY_URL', 'http://localhost:8000');
    }
    async startSession(user, courseworkId) {
        const rows = await this.db.queryWithTenant(user.schoolId, `SELECT cw.*, sub.name as subject_name, sub.id as subject_id
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       WHERE cw.id = $1 AND cw.school_id = $2`, [courseworkId, user.schoolId]);
        if (!rows.length)
            throw new common_1.NotFoundException('Coursework not found');
        const cw = rows[0];
        if (cw.ai_guidance_mode === 'DISABLED') {
            throw new common_1.HttpException('AI tutoring is disabled for this assignment.', common_1.HttpStatus.FORBIDDEN);
        }
        const payload = {
            school_id: user.schoolId,
            student_id: user.id,
            coursework_id: courseworkId,
            subject_name: cw.subject_name,
            assignment_title: cw.title,
            assignment_description: cw.description,
            ai_system_notes: cw.ai_system_notes,
            ai_guidance_mode: cw.ai_guidance_mode,
            teacher_guidance: cw.rubric ?? '',
        };
        const response = await fetch(`${this.aiGatewayUrl}/api/v1/ai/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new common_1.HttpException('AI gateway session start failed', common_1.HttpStatus.BAD_GATEWAY);
        }
        const data = await response.json();
        await this.db.queryWithTenant(user.schoolId, `INSERT INTO ai_tutoring_sessions
         (id, school_id, student_id, coursework_id, session_status, total_tokens_consumed)
       VALUES ($1, $2, $3, $4, 'ACTIVE', 0)
       ON CONFLICT (id) DO NOTHING`, [data.session_id, user.schoolId, user.id, courseworkId]);
        return { ...data, subjectId: cw.subject_id };
    }
    async checkAndDecrementQuota(schoolId, studentId, subjectId) {
        const key = `quota:${schoolId}:${studentId}:${subjectId}`;
        await this.redisService.checkAndIncrementQuota(key, QUOTA_WINDOW_MS, QUOTA_LIMIT);
    }
    async proxyStream(sessionId, message, subjectId, schoolId, studentId, res) {
        const url = new URL(`${this.aiGatewayUrl}/api/v1/ai/chat/stream`);
        const body = JSON.stringify({ session_id: sessionId, student_message: message });
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        let accumulatedResponse = '';
        let wasIntercepted = false;
        const lib = url.protocol === 'https:' ? https : http;
        const req = lib.request({
            host: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
        }, (proxyRes) => {
            let buffer = '';
            proxyRes.on('data', (chunk) => {
                const text = chunk.toString('utf-8');
                buffer += text;
                res.write(chunk);
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';
                for (const line of lines) {
                    if (!line.startsWith('data:'))
                        continue;
                    try {
                        const data = JSON.parse(line.slice(5).trim());
                        if (data.intercepted) {
                            wasIntercepted = true;
                        }
                        if (data.token && !data.done) {
                            accumulatedResponse += data.token;
                        }
                    }
                    catch { }
                }
            });
            proxyRes.on('end', async () => {
                res.end();
                if (accumulatedResponse && sessionId) {
                    try {
                        await this.db.queryWithTenant(schoolId, `INSERT INTO ai_tutoring_messages
                   (session_id, sender_type, content, flagged_jailbreak_attempt, guardrail_response_code)
                 VALUES ($1, 'STUDENT', $2, $3, $4)`, [sessionId, message, wasIntercepted, wasIntercepted ? 'GUARDRAIL_INTERCEPTED' : 'EDUCATIONAL']);
                        await this.db.queryWithTenant(schoolId, `INSERT INTO ai_tutoring_messages (session_id, sender_type, content)
                 VALUES ($1, 'ASSISTANT', $2)`, [sessionId, accumulatedResponse]);
                        const tokenEstimate = Math.ceil((message.length + accumulatedResponse.length) / 4);
                        await this.db.queryWithTenant(schoolId, `UPDATE ai_tutoring_sessions
                 SET total_tokens_consumed = total_tokens_consumed + $1
                 WHERE id = $2`, [tokenEstimate, sessionId]);
                    }
                    catch (err) {
                        console.error('[ai-proxy] DB message persist error:', err);
                    }
                }
            });
        });
        req.on('error', () => {
            res.write(`data: {"error": true, "token": "AI service unavailable. Please try again."}\n\n`);
            res.end();
        });
        req.write(body);
        req.end();
    }
    async getAuditLog(schoolId, limit, filters = {}) {
        const params = [schoolId, limit];
        const conditions = [];
        if (filters.courseworkId) {
            params.push(filters.courseworkId);
            conditions.push(`ats.coursework_id = $${params.length}`);
        }
        if (filters.flaggedOnly) {
            conditions.push(`atm.flagged_jailbreak_attempt = TRUE`);
        }
        const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
        const entries = await this.db.queryWithTenant(schoolId, `SELECT atm.id, atm.session_id, atm.sender_type, atm.content as student_message,
              atm.flagged_jailbreak_attempt, atm.guardrail_response_code, atm.created_at,
              ats.student_id, ats.coursework_id, ats.school_id,
              u.first_name, u.last_name,
              cw.title as coursework_title
       FROM ai_tutoring_messages atm
       JOIN ai_tutoring_sessions ats ON ats.id = atm.session_id
       JOIN users u ON u.id = ats.student_id
       JOIN coursework cw ON cw.id = ats.coursework_id
       WHERE ats.school_id = $1 AND atm.sender_type = 'STUDENT' ${whereClause}
       ORDER BY atm.created_at DESC
       LIMIT $2`, params);
        const mapped = entries.map((r) => ({
            id: r.id,
            session_id: r.session_id,
            sender_type: r.sender_type,
            student_message: r.student_message,
            threat_level: r.flagged_jailbreak_attempt ? 'BLOCKED' : 'SAFE',
            intent_category: r.guardrail_response_code || 'EDUCATIONAL',
            pii_detected: false,
            response_intercepted: Boolean(r.flagged_jailbreak_attempt),
            timestamp: Math.floor(new Date(r.created_at).getTime() / 1000),
            created_at: r.created_at,
            student_id: r.student_id,
            coursework_id: r.coursework_id,
            first_name: r.first_name,
            last_name: r.last_name,
            coursework_title: r.coursework_title,
        }));
        return { school_id: schoolId, total_entries: mapped.length, entries: mapped };
    }
    async getSessionMessages(sessionId) {
        try {
            const response = await fetch(`${this.aiGatewayUrl}/api/v1/ai/sessions/${sessionId}/messages`);
            if (response.ok) {
                const data = await response.json();
                if (data?.messages?.length > 0)
                    return data;
            }
        }
        catch { }
        try {
            const messages = await this.db.query(`SELECT sender_type, content, created_at
         FROM ai_tutoring_messages
         WHERE session_id = $1
         ORDER BY created_at ASC`, [sessionId]);
            if (messages && messages.length > 0) {
                return {
                    session_id: sessionId,
                    messages: messages.map((m) => ({
                        role: m.sender_type === 'STUDENT' ? 'user' : 'assistant',
                        content: m.content,
                    })),
                    source: 'database',
                };
            }
        }
        catch { }
        return { session_id: sessionId, messages: [], source: 'db_fallback', expired: true };
    }
};
exports.AiProxyService = AiProxyService;
exports.AiProxyService = AiProxyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        config_1.ConfigService,
        redis_service_1.RedisService])
], AiProxyService);
//# sourceMappingURL=ai-proxy.service.js.map