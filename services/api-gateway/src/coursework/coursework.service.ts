import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Actor, assertCanManageCoursework, assertCanTeachSection } from '../common/teaching-access';

@Injectable()
export class CourseworkService {
  constructor(private readonly db: DatabaseService) {}

  async createCoursework(actor: Actor, dto: any) {
    const schoolId = actor.schoolId, creatorId = actor.id;
    await assertCanTeachSection(this.db, actor, dto.sectionId, dto.subjectId);
    const defaultDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const accessLevel = dto.accessLevel ?? (dto.isPublic ? 'PUBLIC_DIRECTORY' : 'PRIVATE');
    const isPublic = accessLevel === 'PUBLIC_DIRECTORY' || Boolean(dto.isPublic);

    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO coursework
         (school_id, section_id, subject_id, creator_id, title, description,
          coursework_type, max_score, due_date, ai_guidance_mode, ai_system_notes,
          rubric, time_limit_minutes, is_public, access_level, socratic_system_prompt_override)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        schoolId, dto.sectionId, dto.subjectId, creatorId,
        dto.title, dto.description,
        dto.courseworkType ?? dto.type ?? dto.assessmentType ?? 'HOMEWORK',
        dto.maxScore ?? 100,
        dto.dueDate ? new Date(dto.dueDate).toISOString() : defaultDueDate,
        dto.aiGuidanceMode ?? 'SOCRATIC_STRICT',
        dto.aiSystemNotes ?? null,
        dto.rubric ?? null,
        dto.timeLimitMinutes ?? null,
        isPublic,
        accessLevel,
        dto.socraticSystemPromptOverride ?? null,
      ],
    );
    return rows[0];
  }

  async updateVisibility(actor: Actor, courseworkId: string, accessLevel: string) {
    const schoolId = actor.schoolId;
    await assertCanManageCoursework(this.db, actor, courseworkId);
    const isPublic = accessLevel === 'PUBLIC_DIRECTORY';
    const rows = await this.db.queryWithTenant(
      schoolId,
      `UPDATE coursework
       SET access_level = $1, is_public = $2
       WHERE id = $3 AND school_id = $4
       RETURNING id, title, is_public, access_level`,
      [accessLevel, isPublic, courseworkId, schoolId],
    );
    if (!rows.length) throw new NotFoundException('Coursework not found');
    return rows[0];
  }

  async getTeacherCoursework(schoolId: string, teacherId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT cw.*, sub.name as subject_name, sec.name as section_name,
              (SELECT COUNT(*) FROM submissions s WHERE s.coursework_id = cw.id) as submission_count
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       WHERE cw.creator_id = $1 AND cw.school_id = $2
       ORDER BY cw.created_at DESC`,
      [teacherId, schoolId],
    );
  }

  async getStudentCoursework(
    schoolId: string,
    studentId: string,
    filters: { status?: string; subjectId?: string } = {},
  ) {
    const params: any[] = [studentId, schoolId];
    const conditions: string[] = [];

    if (filters.subjectId) {
      params.push(filters.subjectId);
      conditions.push(`cw.subject_id = $${params.length}`);
    }

    let submissionFilter = '';
    if (filters.status === 'PENDING') {
      submissionFilter = 'AND s.id IS NULL';
    } else if (filters.status === 'SUBMITTED') {
      submissionFilter = `AND s.status = 'SUBMITTED'`;
    } else if (filters.status === 'GRADED') {
      submissionFilter = `AND s.status = 'GRADED'`;
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    return this.db.queryWithTenant(
      schoolId,
      `SELECT cw.id, cw.school_id, cw.section_id, cw.subject_id, cw.title, cw.description,
              cw.coursework_type, cw.max_score, cw.due_date, cw.ai_guidance_mode,
              cw.time_limit_minutes, cw.is_public, cw.access_level, cw.created_at,
              sub.name as subject_name, sec.name as section_name,
              s.id as submission_id, s.status as submission_status, s.score,
              s.teacher_feedback, s.submission_text, s.attachment_urls
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2 ${whereClause} ${submissionFilter}
       ORDER BY cw.due_date ASC`,
      params,
    );
  }

  /** Public Hub Resource Bank: exposes ONLY title, description, subject metadata, and ai_guidance_mode. */
  async getPublicCourseworkList(subject?: string) {
    const params: any[] = [];
    let filter = '';
    if (subject) {
      params.push(`%${subject}%`);
      filter = `AND sub.name ILIKE $1`;
    }
    return this.db.query(
      `SELECT cw.id, cw.title, cw.description, cw.coursework_type, cw.ai_guidance_mode,
              cw.access_level, cw.created_at,
              sub.id as subject_id, sub.name as subject_name,
              sch.name as school_name
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN schools sch ON sch.id = cw.school_id
       WHERE (cw.is_public = TRUE OR cw.access_level = 'PUBLIC_DIRECTORY')
         AND cw.ai_guidance_mode != 'DISABLED'
         ${filter}
       ORDER BY cw.created_at DESC`,
      params,
    );
  }

  /** Fetch public OR unlisted coursework by direct URL UUID (never private coursework). */
  async getPublicCourseworkById(id: string) {
    const rows = await this.db.query(
      `SELECT cw.id, cw.title, cw.description, cw.coursework_type, cw.ai_guidance_mode,
              cw.access_level, cw.created_at,
              sub.id as subject_id, sub.name as subject_name,
              sch.name as school_name
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN schools sch ON sch.id = cw.school_id
       WHERE cw.id = $1
         AND (cw.is_public = TRUE OR cw.access_level IN ('PUBLIC_DIRECTORY', 'UNLISTED'))`,
      [id],
    );
    if (!rows.length) {
      throw new NotFoundException('Public coursework not found or access is restricted.');
    }
    return rows[0];
  }

  async getSubmissions(actor: Actor, courseworkId: string) {
    const schoolId = actor.schoolId;
    await assertCanManageCoursework(this.db, actor, courseworkId);
    return this.db.queryWithTenant(
      schoolId,
      `SELECT sub.*, u.first_name, u.last_name, u.email
       FROM submissions sub
       JOIN users u ON u.id = sub.student_id
       WHERE sub.coursework_id = $1 AND sub.school_id = $2
       ORDER BY sub.submitted_at DESC`,
      [courseworkId, schoolId],
    );
  }

  async submitCoursework(schoolId: string, studentId: string, dto: any) {
    const text = dto.submissionText == null ? null : String(dto.submissionText);
    if (text && text.length > 50_000) throw new BadRequestException('Submission is too long.');
    const attachments = Array.isArray(dto.attachmentUrls) ? dto.attachmentUrls.slice(0, 10) : [];

    // The student must be enrolled in the section this coursework belongs to.
    const allowed = await this.db.queryWithTenant(
      schoolId,
      `SELECT 1
       FROM coursework cw
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $2
       WHERE cw.id = $1 AND cw.school_id = $3`,
      [dto.courseworkId, studentId, schoolId],
    );
    if (!allowed.length) throw new ForbiddenException('You are not enrolled in this class.');

    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO submissions (school_id, coursework_id, student_id, submission_text, attachment_urls, status)
       VALUES ($1,$2,$3,$4,$5::jsonb,'SUBMITTED')
       ON CONFLICT (coursework_id, student_id)
       DO UPDATE SET submission_text = EXCLUDED.submission_text,
                     attachment_urls = EXCLUDED.attachment_urls,
                     submitted_at = NOW(), status = 'SUBMITTED'
       WHERE submissions.status <> 'GRADED'
       RETURNING *`,
      [schoolId, dto.courseworkId, studentId, text, JSON.stringify(attachments)],
    );
    if (!rows.length) throw new ForbiddenException('This work has already been graded and can no longer be changed.');
    return rows[0];
  }

  async gradeSubmission(actor: Actor, submissionId: string, dto: any) {
    const schoolId = actor.schoolId;
    const owner = await this.db.queryWithTenant(
      schoolId, `SELECT coursework_id FROM submissions WHERE id = $1 AND school_id = $2`, [submissionId, schoolId]);
    if (!owner.length) throw new NotFoundException('Submission not found.');
    await assertCanManageCoursework(this.db, actor, owner[0].coursework_id);
    const score = Number(dto.score);
    if (!Number.isFinite(score) || score < 0) throw new BadRequestException('Invalid score.');
    const rows = await this.db.queryWithTenant(
      schoolId,
      `UPDATE submissions s
       SET score = $1, teacher_feedback = $2, status = 'GRADED'
       FROM coursework cw
       WHERE s.id = $3 AND s.school_id = $4
         AND cw.id = s.coursework_id AND $1::numeric <= cw.max_score
       RETURNING s.*`,
      [score, dto.teacherFeedback ?? null, submissionId, schoolId],
    );
    if (!rows.length) {
      throw new NotFoundException('Submission not found, or the score is above the maximum for this coursework.');
    }
    return rows[0];
  }

  async getAiTranscripts(actor: Actor, courseworkId: string) {
    const schoolId = actor.schoolId;
    await assertCanManageCoursework(this.db, actor, courseworkId);
    return this.db.queryWithTenant(
      schoolId,
      `SELECT ats.id as session_id, ats.student_id, ats.session_status,
              ats.total_tokens_consumed, ats.created_at,
              u.first_name, u.last_name, u.email,
              (SELECT COUNT(*) FROM ai_tutoring_messages atm WHERE atm.session_id = ats.id AND atm.sender_type = 'STUDENT') as student_message_count,
              (SELECT COUNT(*) FROM ai_tutoring_messages atm WHERE atm.session_id = ats.id AND atm.flagged_jailbreak_attempt = TRUE) as flagged_count
       FROM ai_tutoring_sessions ats
       JOIN users u ON u.id = ats.student_id
       WHERE ats.coursework_id = $1 AND ats.school_id = $2
       ORDER BY ats.created_at DESC`,
      [courseworkId, schoolId],
    );
  }
}
