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
exports.ParentController = void 0;
const common_1 = require("@nestjs/common");
const guards_1 = require("../auth/guards");
const decorators_1 = require("../auth/decorators");
const database_service_1 = require("../database/database.service");
let ParentController = class ParentController {
    db;
    constructor(db) {
        this.db = db;
    }
    async getMyChildren(user) {
        return this.db.queryWithTenant(user.schoolId, `SELECT psa.student_id, psa.relationship_type,
              u.first_name as student_first_name, u.last_name as student_last_name,
              u.email as student_email
       FROM parent_student_associations psa
       JOIN users u ON u.id = psa.student_id
       WHERE psa.parent_id = $1 AND psa.school_id = $2 AND u.is_active = TRUE
       ORDER BY u.last_name, u.first_name`, [user.id, user.schoolId]);
    }
    async getChildCoursework(user, studentId) {
        const [link] = await this.db.queryWithTenant(user.schoolId, `SELECT 1 FROM parent_student_associations
       WHERE parent_id = $1 AND student_id = $2 AND school_id = $3`, [user.id, studentId, user.schoolId]);
        if (!link)
            return [];
        return this.db.queryWithTenant(user.schoolId, `SELECT cw.id, cw.title, cw.description, cw.coursework_type, cw.due_date,
              cw.max_score, cw.ai_guidance_mode,
              sub.name as subject_name, sec.name as section_name,
              s.status as submission_status, s.score, s.submitted_at
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2
       ORDER BY cw.due_date ASC`, [studentId, user.schoolId]);
    }
};
exports.ParentController = ParentController;
__decorate([
    (0, common_1.Get)('children'),
    (0, decorators_1.Roles)('PARENT'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "getMyChildren", null);
__decorate([
    (0, common_1.Get)('children/:studentId/coursework'),
    (0, decorators_1.Roles)('PARENT'),
    __param(0, (0, decorators_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "getChildCoursework", null);
exports.ParentController = ParentController = __decorate([
    (0, common_1.Controller)('parent'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ParentController);
//# sourceMappingURL=parent.controller.js.map