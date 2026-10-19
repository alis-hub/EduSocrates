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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const super_admin_service_1 = require("./super-admin.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
class CreateSchoolDto {
    name;
    slug;
    domain;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "slug", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSchoolDto.prototype, "domain", void 0);
class UpdateSchoolStatusDto {
    status;
}
__decorate([
    (0, class_validator_1.IsEnum)(['ACTIVE', 'SUSPENDED']),
    __metadata("design:type", String)
], UpdateSchoolStatusDto.prototype, "status", void 0);
let SuperAdminController = class SuperAdminController {
    superAdminService;
    constructor(superAdminService) {
        this.superAdminService = superAdminService;
    }
    getStats() {
        return this.superAdminService.getPlatformStats();
    }
    getSchools() {
        return this.superAdminService.getSchools();
    }
    createSchool(dto) {
        return this.superAdminService.createSchool(dto);
    }
    updateSchoolStatus(id, dto) {
        return this.superAdminService.updateSchoolStatus(id, dto.status);
    }
    getGlobalAiAudit(limit = '100') {
        return this.superAdminService.getGlobalAiAudit(parseInt(limit, 10));
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('schools'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getSchools", null);
__decorate([
    (0, common_1.Post)('schools'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateSchoolDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "createSchool", null);
__decorate([
    (0, common_1.Patch)('schools/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateSchoolStatusDto]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "updateSchoolStatus", null);
__decorate([
    (0, common_1.Get)('ai-audit'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SuperAdminController.prototype, "getGlobalAiAudit", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.Controller)('super-admin'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, decorators_1.Roles)('SUPER_ADMIN'),
    __metadata("design:paramtypes", [super_admin_service_1.SuperAdminService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map