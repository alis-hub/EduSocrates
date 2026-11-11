"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HubController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
const hub_service_1 = require("./hub.service");
class SchoolLeadDto {
    requesterEmail;
    schoolName;
    campusCity;
    roleType;
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], SchoolLeadDto.prototype, "requesterEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], SchoolLeadDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolLeadDto.prototype, "campusCity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SchoolLeadDto.prototype, "roleType", void 0);
class OnboardingWizardDto {
    schoolName;
    domain;
    adminEmail;
    adminPassword;
    adminFirstName;
    adminLastName;
    campusName;
    campusCity;
    className;
    academicYear;
    sectionName;
    subjectName;
    inviteCode;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "domain", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "adminEmail", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "adminPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "adminFirstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "adminLastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "campusName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "campusCity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "className", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "academicYear", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "sectionName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "subjectName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], OnboardingWizardDto.prototype, "inviteCode", void 0);
class UpdateTeacherSandboxDto {
    assignmentTitle;
    assignmentDescription;
    rubricOrNotes;
    aiGuidanceMode;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherSandboxDto.prototype, "assignmentTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherSandboxDto.prototype, "assignmentDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherSandboxDto.prototype, "rubricOrNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeacherSandboxDto.prototype, "aiGuidanceMode", void 0);
class SimulateTeacherSandboxDto {
    studentPrompt;
    history;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SimulateTeacherSandboxDto.prototype, "studentPrompt", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SimulateTeacherSandboxDto.prototype, "history", void 0);
class SandboxStreamDto {
    topic;
    message;
    level;
    mode;
    history;
    anonSessionKey;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SandboxStreamDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SandboxStreamDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SandboxStreamDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SandboxStreamDto.prototype, "mode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SandboxStreamDto.prototype, "history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SandboxStreamDto.prototype, "anonSessionKey", void 0);
class CodeDebugDto {
    language;
    code;
    question;
    level;
    history;
    anonSessionKey;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodeDebugDto.prototype, "language", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodeDebugDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodeDebugDto.prototype, "question", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodeDebugDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CodeDebugDto.prototype, "history", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CodeDebugDto.prototype, "anonSessionKey", void 0);
class FlashcardGenerateDto {
    topic;
    subjectArea;
    courseworkId;
    assignmentTitle;
    assignmentDescription;
    rubric;
    cardCount;
    saveDeck;
    isPublic;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardGenerateDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardGenerateDto.prototype, "subjectArea", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardGenerateDto.prototype, "courseworkId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardGenerateDto.prototype, "assignmentTitle", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardGenerateDto.prototype, "assignmentDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardGenerateDto.prototype, "rubric", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(3),
    (0, class_validator_1.Max)(15),
    __metadata("design:type", Number)
], FlashcardGenerateDto.prototype, "cardCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FlashcardGenerateDto.prototype, "saveDeck", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FlashcardGenerateDto.prototype, "isPublic", void 0);
class FlashcardInputDto {
    conceptTitle;
    clueTier1;
    clueTier2;
    terminalDefinition;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardInputDto.prototype, "conceptTitle", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardInputDto.prototype, "clueTier1", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardInputDto.prototype, "clueTier2", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlashcardInputDto.prototype, "terminalDefinition", void 0);
class CreateDeckDto {
    title;
    subjectArea;
    courseworkId;
    isPublic;
    cards;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeckDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeckDto.prototype, "subjectArea", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDeckDto.prototype, "courseworkId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateDeckDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FlashcardInputDto),
    __metadata("design:type", Array)
], CreateDeckDto.prototype, "cards", void 0);
class ReviewCardDto {
    cardId;
    quality;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewCardDto.prototype, "cardId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], ReviewCardDto.prototype, "quality", void 0);
class EvaluateConceptDto {
    nodeId;
    studentAnswer;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateConceptDto.prototype, "nodeId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EvaluateConceptDto.prototype, "studentAnswer", void 0);
class GenerateQuizDto {
    subject;
    topic;
    difficultyLevel;
    questionCount;
    courseworkId;
    courseworkDescription;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "topic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "difficultyLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2),
    (0, class_validator_1.Max)(15),
    __metadata("design:type", Number)
], GenerateQuizDto.prototype, "questionCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "courseworkId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateQuizDto.prototype, "courseworkDescription", void 0);
class SubmitQuizAttemptDto {
    selectedAnswers;
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SubmitQuizAttemptDto.prototype, "selectedAnswers", void 0);
class CreateThreadDto {
    title;
    body;
    subjectTag;
    isPublic;
    askAiGuide;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThreadDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThreadDto.prototype, "body", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateThreadDto.prototype, "subjectTag", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateThreadDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateThreadDto.prototype, "askAiGuide", void 0);
class CreateReplyDto {
    replyBody;
    summonAiGuide;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReplyDto.prototype, "replyBody", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateReplyDto.prototype, "summonAiGuide", void 0);
class CreateWhiteboardDto {
    title;
    courseworkId;
    isPublic;
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWhiteboardDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateWhiteboardDto.prototype, "courseworkId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateWhiteboardDto.prototype, "isPublic", void 0);
class UpdateWhiteboardDto {
    canvasState;
}
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateWhiteboardDto.prototype, "canvasState", void 0);
class RecordActivityDto {
    xpDelta;
    badgeCode;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(500),
    __metadata("design:type", Number)
], RecordActivityDto.prototype, "xpDelta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RecordActivityDto.prototype, "badgeCode", void 0);
let HubController = class HubController {
    hubService;
    constructor(hubService) {
        this.hubService = hubService;
    }
    getPublicSchools() {
        return this.hubService.getPublicSchools();
    }
    createSchoolLead(dto) {
        return this.hubService.createSchoolLead(dto);
    }
    onboardingWizard(dto) {
        return this.hubService.onboardingWizard(dto);
    }
    startTeacherSandbox() {
        return this.hubService.startTeacherSandbox();
    }
    getTeacherSandbox(token) {
        return this.hubService.getTeacherSandbox(token);
    }
    updateTeacherSandbox(token, dto) {
        return this.hubService.updateTeacherSandbox(token, dto);
    }
    async simulateTeacherSandbox(token, dto, res) {
        await this.hubService.simulateTeacherSandbox(token, dto, res);
    }
    async streamSandbox(dto, user, req, res) {
        const clientIp = req.ip || req.socket.remoteAddress || 'anon';
        await this.hubService.streamSandbox(dto, user, clientIp, res);
    }
    async streamCodeDebug(dto, user, req, res) {
        const clientIp = req.ip || req.socket.remoteAddress || 'anon';
        await this.hubService.streamCodeDebug(dto, user, clientIp, res);
    }
    getDecks(user, courseworkId, subjectArea) {
        return this.hubService.getFlashcardDecks(user, courseworkId, subjectArea);
    }
    getDeckById(deckId, user) {
        return this.hubService.getFlashcardDeckById(deckId, user);
    }
    generateFlashcards(dto, user) {
        return this.hubService.generateFlashcardsAi(dto, user);
    }
    createDeck(dto, user) {
        return this.hubService.createFlashcardDeck(dto, user);
    }
    reviewCard(dto, user) {
        return this.hubService.reviewFlashcard(dto, user);
    }
    getConceptNodes(domain, user) {
        return this.hubService.getConceptNodes(domain, user);
    }
    evaluateConcept(dto, user) {
        return this.hubService.evaluateConceptCheckpoint(dto.nodeId, dto.studentAnswer, user);
    }
    getQuizzes(user, subject) {
        return this.hubService.getPracticeQuizzes(user, subject);
    }
    getQuizById(quizId) {
        return this.hubService.getPracticeQuizById(quizId);
    }
    generateQuiz(dto, user) {
        return this.hubService.generatePracticeQuiz(dto, user);
    }
    submitQuizAttempt(quizId, dto, user) {
        return this.hubService.submitPracticeQuizAttempt(quizId, dto.selectedAnswers, user);
    }
    getThreads(user, subjectTag) {
        return this.hubService.getDiscussionThreads(user, subjectTag);
    }
    getThreadById(threadId) {
        return this.hubService.getDiscussionThreadById(threadId);
    }
    createThread(dto, user) {
        return this.hubService.createDiscussionThread(dto, user);
    }
    createReply(threadId, dto, user) {
        return this.hubService.createDiscussionReply(threadId, dto, user);
    }
    getWhiteboardRooms(user, courseworkId) {
        return this.hubService.getWhiteboardRooms(user, courseworkId);
    }
    createWhiteboardRoom(dto, user) {
        return this.hubService.createWhiteboardRoom(dto, user);
    }
    getWhiteboardRoom(roomId, user) {
        return this.hubService.getWhiteboardRoom(roomId, user);
    }
    updateWhiteboardState(roomId, dto) {
        return this.hubService.updateWhiteboardState(roomId, dto.canvasState);
    }
    getGamificationProfile(user) {
        return this.hubService.getGamificationProfile(user.id);
    }
    recordActivity(dto, user) {
        return this.hubService.recordActivity(user.id, dto.xpDelta ?? 10, dto.badgeCode);
    }
};
exports.HubController = HubController;
__decorate([
    (0, common_1.Get)('public/schools'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getPublicSchools", null);
__decorate([
    (0, common_1.Post)('leads/school-inquiry'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SchoolLeadDto]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "createSchoolLead", null);
__decorate([
    (0, common_1.Post)('onboarding/wizard'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [OnboardingWizardDto]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "onboardingWizard", null);
__decorate([
    (0, common_1.Post)('sandbox/teacher/start'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HubController.prototype, "startTeacherSandbox", null);
__decorate([
    (0, common_1.Get)('sandbox/teacher/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getTeacherSandbox", null);
__decorate([
    (0, common_1.Patch)('sandbox/teacher/:token'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateTeacherSandboxDto]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "updateTeacherSandbox", null);
__decorate([
    (0, common_1.Post)('sandbox/teacher/:token/simulate'),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SimulateTeacherSandboxDto, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "simulateTeacherSandbox", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/sandbox/stream'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SandboxStreamDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "streamSandbox", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/code/debug-socratic'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CodeDebugDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], HubController.prototype, "streamCodeDebug", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/flashcards/decks'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('courseworkId')),
    __param(2, (0, common_1.Query)('subjectArea')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getDecks", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/flashcards/decks/:deckId'),
    __param(0, (0, common_1.Param)('deckId')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getDeckById", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/flashcards/generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [FlashcardGenerateDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "generateFlashcards", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('hub/flashcards/decks'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateDeckDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "createDeck", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('hub/flashcards/review'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ReviewCardDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "reviewCard", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/concepts/nodes'),
    __param(0, (0, common_1.Query)('domain')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getConceptNodes", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/concepts/evaluate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [EvaluateConceptDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "evaluateConcept", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/quizzes'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getQuizzes", null);
__decorate([
    (0, common_1.Get)('hub/quizzes/:quizId'),
    __param(0, (0, common_1.Param)('quizId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getQuizById", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/quizzes/generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [GenerateQuizDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "generateQuiz", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/quizzes/:quizId/attempt'),
    __param(0, (0, common_1.Param)('quizId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, SubmitQuizAttemptDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "submitQuizAttempt", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/discussions/threads'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('subjectTag')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getThreads", null);
__decorate([
    (0, common_1.Get)('hub/discussions/threads/:threadId'),
    __param(0, (0, common_1.Param)('threadId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getThreadById", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('hub/discussions/threads'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateThreadDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "createThread", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('hub/discussions/threads/:threadId/replies'),
    __param(0, (0, common_1.Param)('threadId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateReplyDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "createReply", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/whiteboard/rooms'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('courseworkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getWhiteboardRooms", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Post)('hub/whiteboard/session/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateWhiteboardDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "createWhiteboardRoom", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Get)('hub/whiteboard/:roomId'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getWhiteboardRoom", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.OptionalJwtAuthGuard),
    (0, common_1.Put)('hub/whiteboard/:roomId'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateWhiteboardDto]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "updateWhiteboardState", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Get)('hub/gamification/profile'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "getGamificationProfile", null);
__decorate([
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Post)('hub/gamification/record-activity'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RecordActivityDto, Object]),
    __metadata("design:returntype", void 0)
], HubController.prototype, "recordActivity", null);
exports.HubController = HubController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [hub_service_1.HubService])
], HubController);
//# sourceMappingURL=hub.controller.js.map