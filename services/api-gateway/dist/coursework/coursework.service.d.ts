import { DatabaseService } from '../database/database.service';
export declare class CourseworkService {
    private readonly db;
    constructor(db: DatabaseService);
    createCoursework(schoolId: string, creatorId: string, dto: any): Promise<any>;
    updateVisibility(schoolId: string, courseworkId: string, accessLevel: string): Promise<any>;
    getTeacherCoursework(schoolId: string, teacherId: string): Promise<any[]>;
    getStudentCoursework(schoolId: string, studentId: string, filters?: {
        status?: string;
        subjectId?: string;
    }): Promise<any[]>;
    getPublicCourseworkList(subject?: string): Promise<any[]>;
    getPublicCourseworkById(id: string): Promise<any>;
    getSubmissions(schoolId: string, courseworkId: string): Promise<any[]>;
    submitCoursework(schoolId: string, studentId: string, dto: any): Promise<any>;
    gradeSubmission(schoolId: string, submissionId: string, dto: any): Promise<any>;
    getAiTranscripts(schoolId: string, courseworkId: string): Promise<any[]>;
}
