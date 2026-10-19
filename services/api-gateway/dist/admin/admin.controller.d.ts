import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
declare class CreateCampusDto {
    name: string;
    address?: string;
}
declare class CreateClassDto {
    campusId: string;
    name: string;
    code: string;
}
declare class CreateSectionDto {
    classId: string;
    name: string;
    capacity?: number;
}
declare class CreateSubjectDto {
    classId: string;
    name: string;
    code: string;
}
declare class CreateAcademicYearDto {
    name: string;
    startDate: string;
    endDate: string;
}
declare class CreateEnrollmentDto {
    studentId: string;
    sectionId: string;
    academicYearId: string;
}
declare class CreateAllocationDto {
    teacherId: string;
    subjectId: string;
    sectionId: string;
}
declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    campusId?: string;
}
declare class BulkCreateUsersDto {
    users: any[];
}
declare class CreateParentAssociationDto {
    parentId: string;
    studentId: string;
    relationshipType?: string;
}
export declare class AdminController {
    private readonly adminService;
    private readonly authService;
    constructor(adminService: AdminService, authService: AuthService);
    getCampuses(user: any): Promise<any[]>;
    createCampus(user: any, dto: CreateCampusDto): Promise<any>;
    getClasses(user: any): Promise<any[]>;
    createClass(user: any, dto: CreateClassDto): Promise<any>;
    getSections(user: any): Promise<any[]>;
    createSection(user: any, dto: CreateSectionDto): Promise<any>;
    getSubjects(user: any): Promise<any[]>;
    createSubject(user: any, dto: CreateSubjectDto): Promise<any>;
    getAcademicYears(user: any): Promise<any[]>;
    createAcademicYear(user: any, dto: CreateAcademicYearDto): Promise<any>;
    getEnrollments(user: any): Promise<any[]>;
    createEnrollment(user: any, dto: CreateEnrollmentDto): Promise<any>;
    deleteEnrollment(user: any, id: string): Promise<{
        deleted: boolean;
    }>;
    getAllocations(user: any): Promise<any[]>;
    createAllocation(user: any, dto: CreateAllocationDto): Promise<any>;
    deleteAllocation(user: any, id: string): Promise<{
        deleted: boolean;
    }>;
    getUsers(user: any, role?: string): Promise<any[]>;
    createUser(user: any, dto: CreateUserDto): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
    deactivateUser(user: any, id: string): Promise<any>;
    bulkCreateUsers(user: any, dto: BulkCreateUsersDto): Promise<{
        created: number;
        failed: {
            row: any;
            error: string;
        }[];
    }>;
    getParentAssociations(user: any): Promise<any[]>;
    createParentAssociation(user: any, dto: CreateParentAssociationDto): Promise<any>;
    deleteParentAssociation(user: any, id: string): Promise<{
        deleted: boolean;
    }>;
    getStats(user: any): Promise<{
        campuses: any;
        classes: any;
        sections: any;
        users: any[];
        coursework: any;
        enrollments: any;
    }>;
}
export {};
