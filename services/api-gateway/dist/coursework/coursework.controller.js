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
exports.PublicCourseworkController = exports.CourseworkController = exports.CourseworkAccessLevel = exports.AiGuidanceMode = exports.CourseworkType = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const coursework_service_1 = require("./coursework.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
var CourseworkType;
(function (CourseworkType) {
    CourseworkType["HOMEWORK"] = "HOMEWORK";
    CourseworkType["QUIZ"] = "QUIZ";
    CourseworkType["ASSIGNMENT"] = "ASSIGNMENT";
})(CourseworkType || (exports.CourseworkType = CourseworkType = {}));
var AiGuidanceMode;
(function (AiGuidanceMode) {
    AiGuidanceMode["SOCRATIC_STRICT"] = "SOCRATIC_STRICT";
    AiGuidanceMode["SOCRATIC_HINTS_ONLY"] = "SOCRATIC_HINTS_ONLY";
    AiGuidanceMode["TERMINOLOGY_ONLY"] = "TERMINOLOGY_ONLY";
    AiGuidanceMode["DISABLED"] = "DISABLED";
})(AiGuidanceMode || (exports.AiGuidanceMode = AiGuidanceMode = {}));
var CourseworkAccessLevel;
(function (CourseworkAccessLevel) {
    CourseworkAccessLevel["PRIVATE"] = "PRIVATE";
    CourseworkAccessLevel["PUBLIC_DIRECTORY"] = "PUBLIC_DIRECTORY";
    CourseworkAccessLevel["UNLISTED"] = "UNLISTED";
})(CourseworkAccessLevel || (exports.CourseworkAccessLevel = CourseworkAccessLevel = {}));
class CreateCourseworkDto {
    sectionId;
    subjectId;
    title;
    description;
    courseworkType;
    maxScore;
    dueDate;
    aiGuidanceMode;
    aiSystemNotes;
    rubric;
    timeLimitMinutes;
    isPublic;
    accessLevel;
    socraticSystemPromptOverride;
    assessmentType;
    type;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "sectionId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CourseworkType),
    (0, class_transformer_1.Transform)(({ obj, value }) => value ?? obj.type ?? obj.assessmentType ?? 'HOMEWORK'),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "courseworkType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCourseworkDto.prototype, "maxScore", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AiGuidanceMode),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "aiGuidanceMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "aiSystemNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "rubric", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateCourseworkDto.prototype, "timeLimitMinutes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCourseworkDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(CourseworkAccessLevel),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "accessLevel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "socraticSystemPromptOverride", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "assessmentType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseworkDto.prototype, "type", void 0);
class UpdateVisibilityDto {
    accessLevel;
}
__decorate([
    (0, class_validator_1.IsEnum)(CourseworkAccessLevel),
    __metadata("design:type", String)
], UpdateVisibilityDto.prototype, "accessLevel", void 0);
class GradeSubmissionDto {
    score;
    teacherFeedback;
}
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GradeSubmissionDto.prototype, "score", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GradeSubmissionDto.prototype, "teacherFeedback", void 0);
class StudentSubmitDto {
    courseworkId;
    submissionText;
    attachmentUrls;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StudentSubmitDto.prototype, "courseworkId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], StudentSubmitDto.prototype, "submissionText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], StudentSubmitDto.prototype, "attachmentUrls", void 0);
let CourseworkController = class CourseworkController {
    courseworkService;
    constructor(courseworkService) {
        this.courseworkService = courseworkService;
    }
    createCoursework(user, dto) {
        return this.courseworkService.createCoursework(user.schoolId, user.id, dto);
    }
    getTeacherCoursework(user) {
        return this.courseworkService.getTeacherCoursework(user.schoolId, user.id);
    }
    updateVisibility(user, courseworkId, dto) {
        return this.courseworkService.updateVisibility(user.schoolId, courseworkId, dto.accessLevel);
    }
    getSubmissions(user, courseworkId) {
        return this.courseworkService.getSubmissions(user.schoolId, courseworkId);
    }
    gradeSubmission(user, submissionId, dto) {
        return this.courseworkService.gradeSubmission(user.schoolId, submissionId, dto);
    }
    getStudentCoursework(user, status, subjectId) {
        return this.courseworkService.getStudentCoursework(user.schoolId, user.id, { status, subjectId });
    }
    submitCoursework(user, dto) {
        return this.courseworkService.submitCoursework(user.schoolId, user.id, dto);
    }
    getAiTranscripts(user, courseworkId) {
        return this.courseworkService.getAiTranscripts(user.schoolId, courseworkId);
    }
};
exports.CourseworkController = CourseworkController;
__decorate([
    (0, common_1.Post)('coursework'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateCourseworkDto]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "createCoursework", null);
__decorate([
    (0, common_1.Get)('teacher/coursework'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "getTeacherCoursework", null);
__decorate([
    (0, common_1.Patch)('teacher/coursework/:id/visibility'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, UpdateVisibilityDto]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "updateVisibility", null);
__decorate([
    (0, common_1.Get)('teacher/coursework/:id/submissions'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "getSubmissions", null);
__decorate([
    (0, common_1.Put)('teacher/submissions/:id/grade'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, GradeSubmissionDto]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "gradeSubmission", null);
__decorate([
    (0, common_1.Get)('student/coursework'),
    (0, decorators_1.Roles)('STUDENT'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "getStudentCoursework", null);
__decorate([
    (0, common_1.Post)('student/submissions'),
    (0, decorators_1.Roles)('STUDENT'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, StudentSubmitDto]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "submitCoursework", null);
__decorate([
    (0, common_1.Get)('teacher/coursework/:id/ai-transcripts'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CourseworkController.prototype, "getAiTranscripts", null);
exports.CourseworkController = CourseworkController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [coursework_service_1.CourseworkService])
], CourseworkController);
let PublicCourseworkController = class PublicCourseworkController {
    courseworkService;
    constructor(courseworkService) {
        this.courseworkService = courseworkService;
    }
    listPublicCoursework(subject) {
        return this.courseworkService.getPublicCourseworkList(subject);
    }
    getPublicCourseworkById(id) {
        return this.courseworkService.getPublicCourseworkById(id);
    }
};
exports.PublicCourseworkController = PublicCourseworkController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('subject')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicCourseworkController.prototype, "listPublicCoursework", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PublicCourseworkController.prototype, "getPublicCourseworkById", null);
exports.PublicCourseworkController = PublicCourseworkController = __decorate([
    (0, common_1.Controller)('public/coursework'),
    __metadata("design:paramtypes", [coursework_service_1.CourseworkService])
], PublicCourseworkController);
//# sourceMappingURL=coursework.controller.js.map