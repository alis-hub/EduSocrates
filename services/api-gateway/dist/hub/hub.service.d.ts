import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { AiProxyService } from '../ai-proxy/ai-proxy.service';
export interface AuthUser {
    id: string;
    email: string;
    role: string;
    schoolId: string;
    campusId?: string;
}
export declare class HubService {
    private readonly db;
    private readonly redisService;
    private readonly aiProxyService;
    private readonly jwtService;
    constructor(db: DatabaseService, redisService: RedisService, aiProxyService: AiProxyService, jwtService: JwtService);
    private callAiJson;
    getPublicSchools(): Promise<{
        schools: any[];
    }>;
    createSchoolLead(dto: {
        requesterEmail: string;
        schoolName: string;
        campusCity: string;
        roleType: string;
    }): Promise<{
        lead: any;
        message: string;
    }>;
    onboardingWizard(dto: {
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
    }): Promise<{
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
    updateTeacherSandbox(token: string, updates: {
        assignmentTitle?: string;
        assignmentDescription?: string;
        rubricOrNotes?: string;
        aiGuidanceMode?: string;
    }): Promise<any>;
    simulateTeacherSandbox(token: string, dto: {
        studentPrompt: string;
        history?: Array<{
            role: string;
            content: string;
        }>;
    }, res: Response): Promise<void>;
    private enforceHubQuota;
    streamSandbox(dto: {
        topic: string;
        message: string;
        level?: string;
        mode?: string;
        history?: Array<{
            role: string;
            content: string;
        }>;
        anonSessionKey?: string;
    }, user: AuthUser | null, clientIp: string, res: Response): Promise<void>;
    streamCodeDebug(dto: {
        language: string;
        code: string;
        question: string;
        level?: string;
        history?: Array<{
            role: string;
            content: string;
        }>;
        anonSessionKey?: string;
    }, user: AuthUser | null, clientIp: string, res: Response): Promise<void>;
    getFlashcardDecks(user: AuthUser | null, courseworkId?: string, subjectArea?: string): Promise<{
        decks: any[];
    }>;
    getFlashcardDeckById(deckId: string, user: AuthUser | null): Promise<{
        deck: any;
        cards: any[];
    }>;
    generateFlashcardsAi(dto: {
        topic?: string;
        subjectArea?: string;
        courseworkId?: string;
        assignmentTitle?: string;
        assignmentDescription?: string;
        rubric?: string;
        cardCount?: number;
        saveDeck?: boolean;
        isPublic?: boolean;
    }, user: AuthUser | null): Promise<{
        title: string;
        subject_area: string;
        cards: Array<{
            concept_title: string;
            clue_tier_1: string;
            clue_tier_2: string;
            terminal_definition: string;
        }>;
    } | {
        savedDeck: any;
        cards: any[];
        title: string;
        subject_area: string;
    }>;
    createFlashcardDeck(dto: {
        title: string;
        subjectArea: string;
        courseworkId?: string;
        isPublic?: boolean;
        schoolId?: string;
        cards: Array<{
            conceptTitle: string;
            clueTier1: string;
            clueTier2: string;
            terminalDefinition: string;
        }>;
    }, user: AuthUser): Promise<{
        deck: any;
        cards: any[];
    }>;
    reviewFlashcard(dto: {
        cardId: string;
        quality: number;
    }, user: AuthUser): Promise<{
        review: any;
        gamification: any;
    }>;
    getConceptNodes(domainSlug: string | undefined, user: AuthUser | null): Promise<{
        nodes: any[];
    }>;
    evaluateConceptCheckpoint(nodeId: string, studentAnswer: string, user: AuthUser | null): Promise<{
        nodeId: string;
        gamification: any;
        score: number;
        passed: boolean;
        feedback: string;
    }>;
    getPracticeQuizzes(user: AuthUser | null, subject?: string): Promise<{
        quizzes: any[];
    }>;
    getPracticeQuizById(quizId: string): Promise<{
        quiz: any;
        questions: any[];
    }>;
    generatePracticeQuiz(dto: {
        subject: string;
        topic?: string;
        difficultyLevel?: string;
        questionCount?: number;
        courseworkId?: string;
        courseworkDescription?: string;
    }, user: AuthUser | null): Promise<{
        quiz: any;
        questions: any[];
    }>;
    submitPracticeQuizAttempt(quizId: string, selectedAnswers: Record<string, number>, user: AuthUser | null): Promise<{
        quizId: string;
        score: number;
        correctCount: number;
        totalQuestions: number;
        results: any[];
        debrief: any[] | never[];
        gamification: any;
        persisted: boolean;
    }>;
    getDiscussionThreads(user: AuthUser | null, subjectTag?: string): Promise<{
        threads: any[];
    }>;
    getDiscussionThreadById(threadId: string): Promise<{
        thread: any;
        replies: any[];
    }>;
    createDiscussionThread(dto: {
        title: string;
        body: string;
        subjectTag?: string;
        isPublic?: boolean;
        askAiGuide?: boolean;
    }, user: AuthUser): Promise<{
        thread: any;
        replies: any[];
    }>;
    createDiscussionReply(threadId: string, dto: {
        replyBody: string;
        summonAiGuide?: boolean;
    }, user: AuthUser): Promise<{
        reply: any;
        aiReply: any;
    }>;
    getWhiteboardRooms(user: AuthUser | null, courseworkId?: string): Promise<{
        rooms: any[];
    }>;
    createWhiteboardRoom(dto: {
        title: string;
        courseworkId?: string;
        isPublic?: boolean;
    }, user: AuthUser | null): Promise<{
        room: any;
    }>;
    getWhiteboardRoom(roomId: string, user: AuthUser | null): Promise<{
        room: any;
    }>;
    updateWhiteboardState(roomId: string, canvasState: {
        strokes: any[];
        notes: any[];
    }): Promise<any>;
    getGamificationProfile(userId: string): Promise<any>;
    recordActivity(userId: string, xpDelta: number, badgeCode?: string): Promise<any>;
}
