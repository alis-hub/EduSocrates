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
exports.AiProxyController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const ai_proxy_service_1 = require("./ai-proxy.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
class StartSessionDto {
    courseworkId;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StartSessionDto.prototype, "courseworkId", void 0);
class ChatMessageDto {
    sessionId;
    message;
    subjectId;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "sessionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], ChatMessageDto.prototype, "subjectId", void 0);
let AiProxyController = class AiProxyController {
    aiProxyService;
    constructor(aiProxyService) {
        this.aiProxyService = aiProxyService;
    }
    startSession(user, dto) {
        return this.aiProxyService.startSession(user, dto.courseworkId);
    }
    async chatStream(user, dto, res) {
        const subjectId = dto.subjectId ?? 'unknown';
        await this.aiProxyService.checkAndDecrementQuota(user.schoolId, user.id, subjectId);
        return this.aiProxyService.proxyStream(dto.sessionId, dto.message, subjectId, user.schoolId, user.id, res);
    }
    getAuditLog(user, limit = '100', courseworkId, flaggedOnly) {
        return this.aiProxyService.getAuditLog(user.schoolId, parseInt(limit, 10), {
            courseworkId,
            flaggedOnly: flaggedOnly === 'true',
        });
    }
    getSessionMessages(sessionId) {
        return this.aiProxyService.getSessionMessages(sessionId);
    }
};
exports.AiProxyController = AiProxyController;
__decorate([
    (0, common_1.Post)('ai/session/start'),
    (0, decorators_1.Roles)('STUDENT'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, StartSessionDto]),
    __metadata("design:returntype", void 0)
], AiProxyController.prototype, "startSession", null);
__decorate([
    (0, common_1.Post)('ai/chat/stream'),
    (0, decorators_1.Roles)('STUDENT'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ChatMessageDto, Object]),
    __metadata("design:returntype", Promise)
], AiProxyController.prototype, "chatStream", null);
__decorate([
    (0, common_1.Get)('teacher/analytics/ai-audit'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('courseworkId')),
    __param(3, (0, common_1.Query)('flaggedOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], AiProxyController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)('teacher/ai-sessions/:sessionId/messages'),
    (0, decorators_1.Roles)('TEACHER', 'SCHOOL_ADMIN'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiProxyController.prototype, "getSessionMessages", null);
exports.AiProxyController = AiProxyController = __decorate([
    (0, common_1.Controller)(),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [ai_proxy_service_1.AiProxyService])
], AiProxyController);
//# sourceMappingURL=ai-proxy.controller.js.map