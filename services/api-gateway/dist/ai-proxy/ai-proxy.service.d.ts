import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import type { Response } from 'express';
export declare class AiProxyService {
    private readonly db;
    private readonly config;
    private readonly redisService;
    private readonly aiGatewayUrl;
    constructor(db: DatabaseService, config: ConfigService, redisService: RedisService);
    startSession(user: any, courseworkId: string): Promise<{
        subjectId: any;
        session_id: string;
    }>;
    checkAndDecrementQuota(schoolId: string, studentId: string, subjectId: string): Promise<void>;
    proxyStream(sessionId: string, message: string, subjectId: string, schoolId: string, studentId: string, res: Response): Promise<void>;
    getAuditLog(schoolId: string, limit: number, filters?: {
        courseworkId?: string;
        flaggedOnly?: boolean;
    }): Promise<{
        school_id: string;
        total_entries: number;
        entries: {
            id: any;
            session_id: any;
            sender_type: any;
            student_message: any;
            threat_level: string;
            intent_category: any;
            pii_detected: boolean;
            response_intercepted: boolean;
            timestamp: number;
            created_at: any;
            student_id: any;
            coursework_id: any;
            first_name: any;
            last_name: any;
            coursework_title: any;
        }[];
    }>;
    getSessionMessages(sessionId: string): Promise<any>;
}
