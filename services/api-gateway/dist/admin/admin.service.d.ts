import { DatabaseService } from '../database/database.service';
export declare class AdminService {
    private readonly db;
    constructor(db: DatabaseService);
    getCampuses(schoolId: string): Promise<any[]>;
    createCampus(schoolId: string, dto: {
        name: string;
        address?: string;
    }): Promise<any>;
    getClasses(schoolId: string): Promise<any[]>;
    createClass(schoolId: string, dto: {
        campusId: string;
        name: string;
        code: string;
    }): Promise<any>;
    getSections(schoolId: string): Promise<any[]>;
    createSection(schoolId: string, dto: {
        classId: string;
        name: string;
        capacity?: number;
    }): Promise<any>;
    getSubjects(schoolId: string): Promise<any[]>;
    createSubject(schoolId: string, dto: {
        classId: string;
        name: string;
        code: string;
    }): Promise<any>;
    getAcademicYears(schoolId: string): Promise<any[]>;
    createAcademicYear(schoolId: string, dto: {
        name: string;
        startDate: string;
        endDate: string;
    }): Promise<any>;
    getEnrollments(schoolId: string): Promise<any[]>;
    createEnrollment(schoolId: string, dto: {
        studentId: string;
        sectionId: string;
        academicYearId: string;
    }): Promise<any>;
    deleteEnrollment(schoolId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    getAllocations(schoolId: string): Promise<any[]>;
    createAllocation(schoolId: string, dto: {
        teacherId: string;
        subjectId: string;
        sectionId: string;
    }): Promise<any>;
    deleteAllocation(schoolId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    getUsers(schoolId: string, role?: string): Promise<any[]>;
    deactivateUser(schoolId: string, id: string): Promise<any>;
    bulkCreateUsers(schoolId: string, users: any[], authService: any): Promise<{
        created: number;
        failed: {
            row: any;
            error: string;
        }[];
    }>;
    getParentAssociations(schoolId: string): Promise<any[]>;
    createParentAssociation(schoolId: string, dto: {
        parentId: string;
        studentId: string;
        relationshipType?: string;
    }): Promise<any>;
    deleteParentAssociation(schoolId: string, id: string): Promise<{
        deleted: boolean;
    }>;
    getDashboardStats(schoolId: string): Promise<{
        campuses: any;
        classes: any;
        sections: any;
        users: any[];
        coursework: any;
        enrollments: any;
    }>;
}
