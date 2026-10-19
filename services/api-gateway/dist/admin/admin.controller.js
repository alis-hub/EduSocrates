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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const admin_service_1 = require("./admin.service");
const auth_service_1 = require("../auth/auth.service");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
class CreateCampusDto {
    name;
    address;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCampusDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCampusDto.prototype, "address", void 0);
class CreateClassDto {
    campusId;
    name;
    code;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "campusId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "code", void 0);
class CreateSectionDto {
    classId;
    name;
    capacity;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSectionDto.prototype, "classId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSectionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateSectionDto.prototype, "capacity", void 0);
class CreateSubjectDto {
    classId;
    name;
    code;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "classId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubjectDto.prototype, "code", void 0);
class CreateAcademicYearDto {
    name;
    startDate;
    endDate;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateAcademicYearDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicYearDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAcademicYearDto.prototype, "endDate", void 0);
class CreateEnrollmentDto {
    studentId;
    sectionId;
    academicYearId;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "sectionId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateEnrollmentDto.prototype, "academicYearId", void 0);
class CreateAllocationDto {
    teacherId;
    subjectId;
    sectionId;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAllocationDto.prototype, "teacherId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAllocationDto.prototype, "subjectId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAllocationDto.prototype, "sectionId", void 0);
const ALLOWED_USER_ROLES = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
class CreateUserDto {
    email;
    password;
    firstName;
    lastName;
    role;
    campusId;
}
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ALLOWED_USER_ROLES),
    __metadata("design:type", String)
], CreateUserDto.prototype, "role", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "campusId", void 0);
class BulkCreateUsersDto {
    users;
}
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkCreateUsersDto.prototype, "users", void 0);
class CreateParentAssociationDto {
    parentId;
    studentId;
    relationshipType;
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateParentAssociationDto.prototype, "parentId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateParentAssociationDto.prototype, "studentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateParentAssociationDto.prototype, "relationshipType", void 0);
let AdminController = class AdminController {
    adminService;
    authService;
    constructor(adminService, authService) {
        this.adminService = adminService;
        this.authService = authService;
    }
    getCampuses(user) {
        return this.adminService.getCampuses(user.schoolId);
    }
    createCampus(user, dto) {
        return this.adminService.createCampus(user.schoolId, dto);
    }
    getClasses(user) {
        return this.adminService.getClasses(user.schoolId);
    }
    createClass(user, dto) {
        return this.adminService.createClass(user.schoolId, dto);
    }
    getSections(user) {
        return this.adminService.getSections(user.schoolId);
    }
    createSection(user, dto) {
        return this.adminService.createSection(user.schoolId, dto);
    }
    getSubjects(user) {
        return this.adminService.getSubjects(user.schoolId);
    }
    createSubject(user, dto) {
        return this.adminService.createSubject(user.schoolId, dto);
    }
    getAcademicYears(user) {
        return this.adminService.getAcademicYears(user.schoolId);
    }
    createAcademicYear(user, dto) {
        return this.adminService.createAcademicYear(user.schoolId, dto);
    }
    getEnrollments(user) {
        return this.adminService.getEnrollments(user.schoolId);
    }
    createEnrollment(user, dto) {
        return this.adminService.createEnrollment(user.schoolId, dto);
    }
    deleteEnrollment(user, id) {
        return this.adminService.deleteEnrollment(user.schoolId, id);
    }
    getAllocations(user) {
        return this.adminService.getAllocations(user.schoolId);
    }
    createAllocation(user, dto) {
        return this.adminService.createAllocation(user.schoolId, dto);
    }
    deleteAllocation(user, id) {
        return this.adminService.deleteAllocation(user.schoolId, id);
    }
    getUsers(user, role) {
        return this.adminService.getUsers(user.schoolId, role);
    }
    createUser(user, dto) {
        return this.authService.register({
            ...dto,
            schoolId: user.schoolId,
        });
    }
    deactivateUser(user, id) {
        return this.adminService.deactivateUser(user.schoolId, id);
    }
    async bulkCreateUsers(user, dto) {
        return this.adminService.bulkCreateUsers(user.schoolId, dto.users, this.authService);
    }
    getParentAssociations(user) {
        return this.adminService.getParentAssociations(user.schoolId);
    }
    createParentAssociation(user, dto) {
        return this.adminService.createParentAssociation(user.schoolId, dto);
    }
    deleteParentAssociation(user, id) {
        return this.adminService.deleteParentAssociation(user.schoolId, id);
    }
    getStats(user) {
        return this.adminService.getDashboardStats(user.schoolId);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('campuses'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getCampuses", null);
__decorate([
    (0, common_1.Post)('campuses'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateCampusDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCampus", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Post)('classes'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateClassDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('sections'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSections", null);
__decorate([
    (0, common_1.Post)('sections'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateSectionDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('subjects'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Post)('subjects'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateSubjectDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('academic-years'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAcademicYears", null);
__decorate([
    (0, common_1.Post)('academic-years'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateAcademicYearDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createAcademicYear", null);
__decorate([
    (0, common_1.Get)('enrollments'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getEnrollments", null);
__decorate([
    (0, common_1.Post)('enrollments'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateEnrollmentDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createEnrollment", null);
__decorate([
    (0, common_1.Delete)('enrollments/:id'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteEnrollment", null);
__decorate([
    (0, common_1.Get)('allocations'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getAllocations", null);
__decorate([
    (0, common_1.Post)('allocations'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateAllocationDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createAllocation", null);
__decorate([
    (0, common_1.Delete)('allocations/:id'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteAllocation", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('role')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateUserDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createUser", null);
__decorate([
    (0, common_1.Patch)('users/:id/deactivate'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deactivateUser", null);
__decorate([
    (0, common_1.Post)('users/bulk'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, BulkCreateUsersDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "bulkCreateUsers", null);
__decorate([
    (0, common_1.Get)('parent-associations'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getParentAssociations", null);
__decorate([
    (0, common_1.Post)('parent-associations'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateParentAssociationDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createParentAssociation", null);
__decorate([
    (0, common_1.Delete)('parent-associations/:id'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteParentAssociation", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, decorators_1.Roles)('SCHOOL_ADMIN', 'SUPER_ADMIN'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "getStats", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService,
        auth_service_1.AuthService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map