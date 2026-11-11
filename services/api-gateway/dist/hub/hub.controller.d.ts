import type { Request, Response } from 'express';
import { HubService, AuthUser } from './hub.service';
declare class SchoolLeadDto {
    requesterEmail: string;
    schoolName: string;
    campusCity: string;
    roleType: string;
}
declare class OnboardingWizardDto {
    schoolName: string;
    domain?: string;
    adminEmail: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    campusName: string;
    campusCity: string;
    className: string;
    academicYear?: string;
    sectionName?: string;
    subjectName: string;
    inviteCode?: string;
}
declare class UpdateTeacherSandboxDto {
    assignmentTitle?: string;
    assignmentDescription?: string;
    rubricOrNotes?: string;
    aiGuidanceMode?: string;
}
declare class SimulateTeacherSandboxDto {
    studentPrompt: string;
    history?: Array<{
        role: string;
        content: string;
    }>;
}
declare class SandboxStreamDto {
    topic: string;
    message: string;
    level?: string;
    mode?: string;
    history?: Array<{
        role: string;
        content: string;
    }>;
    anonSessionKey?: string;
}
declare class CodeDebugDto {
    language: string;
    code: string;
    question: string;
    level?: string;
    history?: Array<{
        role: string;
        content: string;
    }>;
    anonSessionKey?: string;
}
declare class FlashcardGenerateDto {
    topic?: string;
    subjectArea?: string;
    courseworkId?: string;
    assignmentTitle?: string;
    assignmentDescription?: string;
    rubric?: string;
    cardCount?: number;
    saveDeck?: boolean;
    isPublic?: boolean;
}
declare class FlashcardInputDto {
    conceptTitle: string;
    clueTier1: string;
    clueTier2: string;
    terminalDefinition: string;
}
declare class CreateDeckDto {
    title: string;
    subjectArea: string;
    courseworkId?: string;
    isPublic?: boolean;
    cards: FlashcardInputDto[];
}
declare class ReviewCardDto {
    cardId: string;
    quality: number;
}
declare class EvaluateConceptDto {
    nodeId: string;
    studentAnswer: string;
}
declare class GenerateQuizDto {
    subject: string;
    topic?: string;
    difficultyLevel?: string;
    questionCount?: number;
    courseworkId?: string;
    courseworkDescription?: string;
}
declare class SubmitQuizAttemptDto {
    selectedAnswers: Record<string, number>;
}
declare class CreateThreadDto {
    title: string;
    body: string;
    subjectTag?: string;
    isPublic?: boolean;
    askAiGuide?: boolean;
}
declare class CreateReplyDto {
    replyBody: string;
    summonAiGuide?: boolean;
}
declare class CreateWhiteboardDto {
    title: string;
    courseworkId?: string;
    isPublic?: boolean;
}
declare class UpdateWhiteboardDto {
    canvasState: {
        strokes: any[];
        notes: any[];
    };
}
declare class RecordActivityDto {
    xpDelta?: number;
    badgeCode?: string;
}
export declare class HubController {
    private readonly hubService;
    constructor(hubService: HubService);
    getPublicSchools(): Promise<{
        schools: any[];
    }>;
    createSchoolLead(dto: SchoolLeadDto): Promise<{
        lead: any;
        message: string;
    }>;
    onboardingWizard(dto: OnboardingWizardDto): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            schoolId: any;
            campusId: any;
            schoolName: any;
        };
        provisioned: {
            school: any;
            campus: any;
            academicClass: any;
            section: any;
            subject: any;
            inviteCode: any;
        };
    }>;
    startTeacherSandbox(): Promise<any>;
    getTeacherSandbox(token: string): Promise<any>;
    updateTeacherSandbox(token: string, dto: UpdateTeacherSandboxDto): Promise<any>;
    simulateTeacherSandbox(token: string, dto: SimulateTeacherSandboxDto, res: Response): Promise<void>;
    streamSandbox(dto: SandboxStreamDto, user: AuthUser | null, req: Request, res: Response): Promise<void>;
    streamCodeDebug(dto: CodeDebugDto, user: AuthUser | null, req: Request, res: Response): Promise<void>;
    getDecks(user: AuthUser | null, courseworkId?: string, subjectArea?: string): Promise<{
        decks: any[];
    }>;
    getDeckById(deckId: string, user: AuthUser | null): Promise<{
        deck: any;
        cards: any[];
    }>;
    generateFlashcards(dto: FlashcardGenerateDto, user: AuthUser | null): Promise<{
        title: string;
        subject_area: string;
        cards: {
            concept_title: string;
            clue_tier_1: string;
            clue_tier_2: string;
            terminal_definition: string;
        }[];
    } | {
        savedDeck: any;
        cards: any[];
        title: string;
        subject_area: string;
    }>;
    createDeck(dto: CreateDeckDto, user: AuthUser): Promise<{
        deck: any;
        cards: any[];
    }>;
    reviewCard(dto: ReviewCardDto, user: AuthUser): Promise<{
        review: any;
        gamification: any;
    }>;
    getConceptNodes(domain: string | undefined, user: AuthUser | null): Promise<{
        nodes: any[];
    }>;
    evaluateConcept(dto: EvaluateConceptDto, user: AuthUser | null): Promise<{
        nodeId: string;
        gamification: any;
        score: number;
        passed: boolean;
        feedback: string;
    }>;
    getQuizzes(user: AuthUser | null, subject?: string): Promise<{
        quizzes: any[];
    }>;
    getQuizById(quizId: string): Promise<{
        quiz: any;
        questions: any[];
    }>;
    generateQuiz(dto: GenerateQuizDto, user: AuthUser | null): Promise<{
        quiz: any;
        questions: any[];
    }>;
    submitQuizAttempt(quizId: string, dto: SubmitQuizAttemptDto, user: AuthUser | null): Promise<{
        quizId: string;
        score: number;
        correctCount: number;
        totalQuestions: number;
        results: any[];
        debrief: any[] | never[];
        gamification: any;
        persisted: boolean;
    }>;
    getThreads(user: AuthUser | null, subjectTag?: string): Promise<{
        threads: any[];
    }>;
    getThreadById(threadId: string): Promise<{
        thread: any;
        replies: any[];
    }>;
    createThread(dto: CreateThreadDto, user: AuthUser): Promise<{
        thread: any;
        replies: any[];
    }>;
    createReply(threadId: string, dto: CreateReplyDto, user: AuthUser): Promise<{
        reply: any;
        aiReply: any;
    }>;
    getWhiteboardRooms(user: AuthUser | null, courseworkId?: string): Promise<{
        rooms: any[];
    }>;
    createWhiteboardRoom(dto: CreateWhiteboardDto, user: AuthUser | null): Promise<{
        room: any;
    }>;
    getWhiteboardRoom(roomId: string, user: AuthUser | null): Promise<{
        room: any;
    }>;
    updateWhiteboardState(roomId: string, dto: UpdateWhiteboardDto): Promise<any>;
    getGamificationProfile(user: AuthUser): Promise<any>;
    recordActivity(dto: RecordActivityDto, user: AuthUser): Promise<any>;
}
export {};
