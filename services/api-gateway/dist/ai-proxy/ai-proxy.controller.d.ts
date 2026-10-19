import { AiProxyService } from './ai-proxy.service';
import type { Response } from 'express';
declare class StartSessionDto {
    courseworkId: string;
}
declare class ChatMessageDto {
    sessionId: string;
    message: string;
    subjectId?: string;
}
export declare class AiProxyController {
    private readonly aiProxyService;
    constructor(aiProxyService: AiProxyService);
    startSession(user: any, dto: StartSessionDto): Promise<{
        subjectId: any;
        session_id: string;
    }>;
    chatStream(user: any, dto: ChatMessageDto, res: Response): Promise<void>;
    getAuditLog(user: any, limit?: string, courseworkId?: string, flaggedOnly?: string): Promise<{
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
export {};
