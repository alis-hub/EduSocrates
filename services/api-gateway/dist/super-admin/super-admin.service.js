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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let SuperAdminService = class SuperAdminService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getSchools() {
        return this.db.query(`SELECT s.*,
              (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'STUDENT' AND u.is_active = TRUE) AS student_count,
              (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'TEACHER' AND u.is_active = TRUE) AS teacher_count,
              (SELECT COUNT(*) FROM coursework cw WHERE cw.school_id = s.id) AS coursework_count
       FROM schools s
       ORDER BY s.created_at DESC`);
    }
    async createSchool(dto) {
        const rows = await this.db.query(`INSERT INTO schools (name, slug, domain, subscription_status)
       VALUES ($1, $2, $3, 'ACTIVE') RETURNING *`, [dto.name, dto.slug, dto.domain || null]);
        return rows[0];
    }
    async updateSchoolStatus(id, status) {
        const rows = await this.db.query(`UPDATE schools SET subscription_status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, name, subscription_status`, [status, id]);
        return rows[0];
    }
    async getPlatformStats() {
        const [schools, students, teachers, admins, courseworkTotal, aiSessions] = await Promise.all([
            this.db.query(`SELECT COUNT(*) as count FROM schools WHERE subscription_status = 'ACTIVE'`),
            this.db.query(`SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT' AND is_active = TRUE`),
            this.db.query(`SELECT COUNT(*) as count FROM users WHERE role = 'TEACHER' AND is_active = TRUE`),
            this.db.query(`SELECT COUNT(*) as count FROM users WHERE role = 'SCHOOL_ADMIN' AND is_active = TRUE`),
            this.db.query(`SELECT COUNT(*) as count FROM coursework`),
            this.db.query(`SELECT COUNT(*) as count FROM ai_tutoring_sessions`),
        ]);
        return {
            schools: Number(schools[0]?.count ?? 0),
            students: Number(students[0]?.count ?? 0),
            teachers: Number(teachers[0]?.count ?? 0),
            admins: Number(admins[0]?.count ?? 0),
            courseworkTotal: Number(courseworkTotal[0]?.count ?? 0),
            aiSessions: Number(aiSessions[0]?.count ?? 0),
        };
    }
    async getGlobalAiAudit(limit) {
        const rows = await this.db.query(`SELECT atm.id, atm.session_id, atm.content as student_message,
              atm.flagged_jailbreak_attempt, atm.guardrail_response_code,
              atm.created_at,
              ats.school_id, ats.student_id,
              s.name as school_name,
              u.first_name, u.last_name,
              cw.title as coursework_title
       FROM ai_tutoring_messages atm
       JOIN ai_tutoring_sessions ats ON ats.id = atm.session_id
       JOIN schools s ON s.id = ats.school_id
       JOIN users u ON u.id = ats.student_id
       JOIN coursework cw ON cw.id = ats.coursework_id
       WHERE atm.sender_type = 'STUDENT'
       ORDER BY atm.created_at DESC
       LIMIT $1`, [limit]);
        const entries = rows.map((r) => ({
            id: r.id,
            session_id: r.session_id,
            school_id: r.school_id,
            school_name: r.school_name,
            student_name: `${r.first_name} ${r.last_name}`,
            coursework_title: r.coursework_title,
            student_message: r.student_message,
            threat_level: r.flagged_jailbreak_attempt ? 'BLOCKED' : 'SAFE',
            intent_category: r.guardrail_response_code || 'EDUCATIONAL',
            pii_detected: false,
            response_intercepted: Boolean(r.flagged_jailbreak_attempt),
            timestamp: Math.floor(new Date(r.created_at).getTime() / 1000),
            created_at: r.created_at,
        }));
        return { total_entries: entries.length, entries };
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map