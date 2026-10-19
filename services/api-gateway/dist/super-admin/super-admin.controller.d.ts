import { SuperAdminService } from './super-admin.service';
declare class CreateSchoolDto {
    name: string;
    slug: string;
    domain?: string;
}
declare class UpdateSchoolStatusDto {
    status: 'ACTIVE' | 'SUSPENDED';
}
export declare class SuperAdminController {
    private readonly superAdminService;
    constructor(superAdminService: SuperAdminService);
    getStats(): Promise<{
        schools: number;
        students: number;
        teachers: number;
        admins: number;
        courseworkTotal: number;
        aiSessions: number;
    }>;
    getSchools(): Promise<any[]>;
    createSchool(dto: CreateSchoolDto): Promise<any>;
    updateSchoolStatus(id: string, dto: UpdateSchoolStatusDto): Promise<any>;
    getGlobalAiAudit(limit?: string): Promise<{
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
export {};
