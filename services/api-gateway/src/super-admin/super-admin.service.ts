import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SuperAdminService {
  constructor(private readonly db: DatabaseService) {}

  /** List all schools across the platform (no RLS — cross-tenant). */
  async getSchools() {
    return this.db.query(
      `SELECT s.*,
              (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'STUDENT' AND u.is_active = TRUE) AS student_count,
              (SELECT COUNT(*) FROM users u WHERE u.school_id = s.id AND u.role = 'TEACHER' AND u.is_active = TRUE) AS teacher_count,
              (SELECT COUNT(*) FROM coursework cw WHERE cw.school_id = s.id) AS coursework_count
       FROM schools s
       ORDER BY s.created_at DESC`,
    );
  }

  /** Onboard a new school (tenant). */
  async createSchool(dto: { name: string; slug: string; domain?: string }) {
    const rows = await this.db.query(
      `INSERT INTO schools (name, slug, domain, subscription_status)
       VALUES ($1, $2, $3, 'ACTIVE') RETURNING *`,
      [dto.name, dto.slug, dto.domain || null],
    );
    return rows[0];
  }

  /** Activate or suspend a school. */
  async updateSchoolStatus(id: string, status: 'ACTIVE' | 'SUSPENDED') {
    const rows = await this.db.query(
      `UPDATE schools SET subscription_status = $1, updated_at = NOW()
       WHERE id = $2 RETURNING id, name, subscription_status`,
      [status, id],
    );
    return rows[0];
  }

  /** Platform-wide stats. */
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

  /** Global AI audit log — all schools, most recent first. */
  async getGlobalAiAudit(limit: number) {
    const rows = await this.db.query(
      `SELECT atm.id, atm.session_id, atm.content as student_message,
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
       LIMIT $1`,
      [limit],
    );

    const entries = rows.map((r: any) => ({
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
}


