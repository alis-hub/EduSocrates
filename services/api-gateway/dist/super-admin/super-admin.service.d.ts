import { DatabaseService } from '../database/database.service';
export declare class SuperAdminService {
    private readonly db;
    constructor(db: DatabaseService);
    getSchools(): Promise<any[]>;
    createSchool(dto: {
        name: string;
        slug: string;
        domain?: string;
    }): Promise<any>;
    updateSchoolStatus(id: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<any>;
    getPlatformStats(): Promise<{
        schools: number;
        students: number;
        teachers: number;
        admins: number;
        courseworkTotal: number;
        aiSessions: number;
    }>;
    getGlobalAiAudit(limit: number): Promise<{
        total_entries: number;
        entries: {
            id: any;
            session_id: any;
            school_id: any;
            school_name: any;
            student_name: string;
            coursework_title: any;
            student_message: any;
            threat_level: string;
            intent_category: any;
            pii_detected: boolean;
            response_intercepted: boolean;
            timestamp: number;
            created_at: any;
        }[];
    }>;
}
