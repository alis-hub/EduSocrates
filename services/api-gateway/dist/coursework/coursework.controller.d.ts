import { CourseworkService } from './coursework.service';
export declare enum CourseworkType {
    HOMEWORK = "HOMEWORK",
    QUIZ = "QUIZ",
    ASSIGNMENT = "ASSIGNMENT"
}
export declare enum AiGuidanceMode {
    SOCRATIC_STRICT = "SOCRATIC_STRICT",
    SOCRATIC_HINTS_ONLY = "SOCRATIC_HINTS_ONLY",
    TERMINOLOGY_ONLY = "TERMINOLOGY_ONLY",
    DISABLED = "DISABLED"
}
export declare enum CourseworkAccessLevel {
    PRIVATE = "PRIVATE",
    PUBLIC_DIRECTORY = "PUBLIC_DIRECTORY",
    UNLISTED = "UNLISTED"
}
declare class CreateCourseworkDto {
    sectionId: string;
    subjectId: string;
    title: string;
    description: string;
    courseworkType: CourseworkType;
    maxScore?: number;
    dueDate?: string;
    aiGuidanceMode?: AiGuidanceMode;
    aiSystemNotes?: string;
    rubric?: string;
    timeLimitMinutes?: number;
    isPublic?: boolean;
    accessLevel?: CourseworkAccessLevel;
    socraticSystemPromptOverride?: string;
    assessmentType?: string;
    type?: string;
}
declare class UpdateVisibilityDto {
    accessLevel: CourseworkAccessLevel;
}
declare class GradeSubmissionDto {
    score: number;
    teacherFeedback?: string;
}
declare class StudentSubmitDto {
    courseworkId: string;
    submissionText?: string;
    attachmentUrls?: string[];
}
export declare class CourseworkController {
    private readonly courseworkService;
    constructor(courseworkService: CourseworkService);
    createCoursework(user: any, dto: CreateCourseworkDto): Promise<any>;
    getTeacherCoursework(user: any): Promise<any[]>;
    updateVisibility(user: any, courseworkId: string, dto: UpdateVisibilityDto): Promise<any>;
    getSubmissions(user: any, courseworkId: string): Promise<any[]>;
    gradeSubmission(user: any, submissionId: string, dto: GradeSubmissionDto): Promise<any>;
    getStudentCoursework(user: any, status?: string, subjectId?: string): Promise<any[]>;
    submitCoursework(user: any, dto: StudentSubmitDto): Promise<any>;
    getAiTranscripts(user: any, courseworkId: string): Promise<any[]>;
}
export declare class PublicCourseworkController {
    private readonly courseworkService;
    constructor(courseworkService: CourseworkService);
    listPublicCoursework(subject?: string): Promise<any[]>;
    getPublicCourseworkById(id: string): Promise<any>;
}
export {};
