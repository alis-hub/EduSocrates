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
exports.CourseworkService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let CourseworkService = class CourseworkService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createCoursework(schoolId, creatorId, dto) {
        const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const rows = await this.db.queryWithTenant(schoolId, `INSERT INTO coursework
         (school_id, section_id, subject_id, creator_id, title, description,
          coursework_type, max_score, due_date, ai_guidance_mode, ai_system_notes,
          rubric, time_limit_minutes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`, [
            schoolId, dto.sectionId, dto.subjectId, creatorId,
            dto.title, dto.description,
            dto.courseworkType ?? dto.type ?? dto.assessmentType ?? 'HOMEWORK',
            dto.maxScore ?? 100,
            dto.dueDate ? new Date(dto.dueDate).toISOString() : defaultDueDate,
            dto.aiGuidanceMode ?? 'SOCRATIC_STRICT',
            dto.aiSystemNotes ?? null,
            dto.rubric ?? null,
            dto.timeLimitMinutes ?? null,
        ]);
        return rows[0];
    }
    async getTeacherCoursework(schoolId, teacherId) {
        return this.db.queryWithTenant(schoolId, `SELECT cw.*, sub.name as subject_name, sec.name as section_name,
              (SELECT COUNT(*) FROM submissions s WHERE s.coursework_id = cw.id) as submission_count
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       WHERE cw.creator_id = $1 AND cw.school_id = $2
       ORDER BY cw.created_at DESC`, [teacherId, schoolId]);
    }
    async getStudentCoursework(schoolId, studentId, filters = {}) {
        const params = [studentId, schoolId];
        const conditions = [];
        if (filters.subjectId) {
            params.push(filters.subjectId);
            conditions.push(`cw.subject_id = $${params.length}`);
        }
        let submissionFilter = '';
        if (filters.status === 'PENDING') {
            submissionFilter = 'AND s.id IS NULL';
        }
        else if (filters.status === 'SUBMITTED') {
            submissionFilter = `AND s.status = 'SUBMITTED'`;
        }
        else if (filters.status === 'GRADED') {
            submissionFilter = `AND s.status = 'GRADED'`;
        }
        const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
        return this.db.queryWithTenant(schoolId, `SELECT cw.*, sub.name as subject_name, sec.name as section_name,
              s.id as submission_id, s.status as submission_status, s.score,
              s.teacher_feedback, s.submission_text, s.attachment_urls
       FROM coursework cw

       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2 ${whereClause} ${submissionFilter}
       ORDER BY cw.due_date ASC`, params);
    }
    async getSubmissions(schoolId, courseworkId) {
        return this.db.queryWithTenant(schoolId, `SELECT sub.*, u.first_name, u.last_name, u.email
       FROM submissions sub
       JOIN users u ON u.id = sub.student_id
       WHERE sub.coursework_id = $1 AND sub.school_id = $2
       ORDER BY sub.submitted_at DESC`, [courseworkId, schoolId]);
    }
    async submitCoursework(schoolId, studentId, dto) {
        const rows = await this.db.queryWithTenant(schoolId, `INSERT INTO submissions (school_id, coursework_id, student_id, submission_text, attachment_urls, status)
       VALUES ($1,$2,$3,$4,$5::jsonb,'SUBMITTED')
       ON CONFLICT (coursework_id, student_id)
       DO UPDATE SET submission_text = EXCLUDED.submission_text,
                     attachment_urls = EXCLUDED.attachment_urls,
                     submitted_at = NOW(), status = 'SUBMITTED'
       RETURNING *`, [
            schoolId, dto.courseworkId, studentId,
            dto.submissionText ?? null,
            JSON.stringify(dto.attachmentUrls ?? []),
        ]);
        return rows[0];
    }
    async gradeSubmission(schoolId, submissionId, dto) {
        const rows = await this.db.queryWithTenant(schoolId, `UPDATE submissions SET score = $1, teacher_feedback = $2, status = 'GRADED'
       WHERE id = $3 AND school_id = $4
       RETURNING *`, [dto.score, dto.teacherFeedback ?? null, submissionId, schoolId]);
        if (!rows.length)
            throw new common_1.NotFoundException('Submission not found');
        return rows[0];
    }
    async getAiTranscripts(schoolId, courseworkId) {
        return this.db.queryWithTenant(schoolId, `SELECT ats.id as session_id, ats.student_id, ats.session_status,
              ats.total_tokens_consumed, ats.created_at,
              u.first_name, u.last_name, u.email,
              (SELECT COUNT(*) FROM ai_tutoring_messages atm WHERE atm.session_id = ats.id AND atm.sender_type = 'STUDENT') as student_message_count,
              (SELECT COUNT(*) FROM ai_tutoring_messages atm WHERE atm.session_id = ats.id AND atm.flagged_jailbreak_attempt = TRUE) as flagged_count
       FROM ai_tutoring_sessions ats
       JOIN users u ON u.id = ats.student_id
       WHERE ats.coursework_id = $1 AND ats.school_id = $2
       ORDER BY ats.created_at DESC`, [courseworkId, schoolId]);
    }
};
exports.CourseworkService = CourseworkService;
exports.CourseworkService = CourseworkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CourseworkService);
//# sourceMappingURL=coursework.service.js.map