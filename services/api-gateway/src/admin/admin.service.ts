import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class AdminService {
  constructor(private readonly db: DatabaseService) {}

  // ── Campuses ─────────────────────────────────────────────────────────────── //
  async getCampuses(schoolId: string) {
    return this.db.queryWithTenant(schoolId, `SELECT * FROM campuses WHERE school_id = $1 ORDER BY name`, [schoolId]);
  }

  async createCampus(schoolId: string, dto: { name: string; address?: string }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO campuses (school_id, name, address) VALUES ($1, $2, $3) RETURNING *`,
      [schoolId, dto.name, dto.address || null],
    );
    return rows[0];
  }

  // ── Classes ──────────────────────────────────────────────────────────────── //
  async getClasses(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT c.*, camp.name as campus_name FROM classes c
       JOIN campuses camp ON camp.id = c.campus_id
       WHERE c.school_id = $1 ORDER BY c.name`,
      [schoolId],
    );
  }

  async createClass(schoolId: string, dto: { campusId: string; name: string; code: string }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO classes (school_id, campus_id, name, code) VALUES ($1, $2, $3, $4) RETURNING *`,
      [schoolId, dto.campusId, dto.name, dto.code],
    );
    return rows[0];
  }

  // ── Sections ─────────────────────────────────────────────────────────────── //
  async getSections(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT s.*, c.name as class_name, c.code as class_code FROM sections s
       JOIN classes c ON c.id = s.class_id WHERE s.school_id = $1 ORDER BY s.name`,
      [schoolId],
    );
  }

  async createSection(schoolId: string, dto: { classId: string; name: string; capacity?: number }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO sections (school_id, class_id, name, capacity) VALUES ($1, $2, $3, $4) RETURNING *`,
      [schoolId, dto.classId, dto.name, dto.capacity || 35],
    );
    return rows[0];
  }

  // ── Subjects ─────────────────────────────────────────────────────────────── //
  async getSubjects(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT sub.*, c.name as class_name FROM subjects sub
       JOIN classes c ON c.id = sub.class_id WHERE sub.school_id = $1 ORDER BY sub.name`,
      [schoolId],
    );
  }

  async createSubject(schoolId: string, dto: { classId: string; name: string; code: string }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO subjects (school_id, class_id, name, code) VALUES ($1, $2, $3, $4) RETURNING *`,
      [schoolId, dto.classId, dto.name, dto.code],
    );
    return rows[0];
  }

  // ── Academic Years ───────────────────────────────────────────────────────── //
  async getAcademicYears(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT * FROM academic_years WHERE school_id = $1 ORDER BY start_date DESC`,
      [schoolId],
    );
  }

  async createAcademicYear(schoolId: string, dto: { name: string; startDate: string; endDate: string }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO academic_years (school_id, name, start_date, end_date, is_active)
       VALUES ($1, $2, $3, $4, TRUE) RETURNING *`,
      [schoolId, dto.name, dto.startDate, dto.endDate],
    );
    return rows[0];
  }

  // ── Enrollments ──────────────────────────────────────────────────────────── //
  async getEnrollments(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT e.*,
              u.first_name, u.last_name, u.email,
              sec.name as section_name,
              c.name as class_name,
              ay.name as academic_year_name
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       JOIN sections sec ON sec.id = e.section_id
       JOIN classes c ON c.id = sec.class_id
       JOIN academic_years ay ON ay.id = e.academic_year_id
       WHERE e.school_id = $1
       ORDER BY ay.name DESC, u.last_name`,
      [schoolId],
    );
  }

  async createEnrollment(schoolId: string, dto: { studentId: string; sectionId: string; academicYearId: string }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO enrollments (school_id, student_id, section_id, academic_year_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [schoolId, dto.studentId, dto.sectionId, dto.academicYearId],
    );
    return rows[0];
  }

  async deleteEnrollment(schoolId: string, id: string) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `DELETE FROM enrollments WHERE id = $1 AND school_id = $2 RETURNING id`,
      [id, schoolId],
    );
    if (!rows.length) throw new NotFoundException('Enrollment not found');
    return { deleted: true };
  }

  // ── Teacher-Subject Allocations ──────────────────────────────────────────── //
  async getAllocations(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT tsa.*,
              u.first_name as teacher_first_name, u.last_name as teacher_last_name,
              sub.name as subject_name, sub.code as subject_code,
              sec.name as section_name
       FROM teacher_subject_allocations tsa
       JOIN users u ON u.id = tsa.teacher_id
       JOIN subjects sub ON sub.id = tsa.subject_id
       JOIN sections sec ON sec.id = tsa.section_id
       WHERE tsa.school_id = $1
       ORDER BY u.last_name`,
      [schoolId],
    );
  }

  async createAllocation(schoolId: string, dto: { teacherId: string; subjectId: string; sectionId: string }) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO teacher_subject_allocations (school_id, teacher_id, subject_id, section_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [schoolId, dto.teacherId, dto.subjectId, dto.sectionId],
    );
    return rows[0];
  }

  async deleteAllocation(schoolId: string, id: string) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `DELETE FROM teacher_subject_allocations WHERE id = $1 AND school_id = $2 RETURNING id`,
      [id, schoolId],
    );
    if (!rows.length) throw new NotFoundException('Allocation not found');
    return { deleted: true };
  }

  // ── User Management ──────────────────────────────────────────────────────── //
  async getUsers(schoolId: string, role?: string) {
    const params: any[] = [schoolId];
    let roleFilter = '';
    if (role) {
      params.push(role);
      roleFilter = `AND u.role = $${params.length}`;
    }
    return this.db.queryWithTenant(
      schoolId,
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active,
              u.created_at, camp.name as campus_name
       FROM users u
       LEFT JOIN campuses camp ON camp.id = u.campus_id
       WHERE u.school_id = $1 ${roleFilter}
       ORDER BY u.role, u.last_name`,
      params,
    );
  }

  async deactivateUser(schoolId: string, id: string) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `UPDATE users SET is_active = FALSE WHERE id = $1 AND school_id = $2 RETURNING id, email, is_active`,
      [id, schoolId],
    );
    if (!rows.length) throw new NotFoundException('User not found');
    return rows[0];
  }

  /**
   * Bulk user provisioning.
   * Accepts an array of user rows, registers each one, collects failures.
   */
  async bulkCreateUsers(schoolId: string, users: any[], authService: any) {
    let created = 0;
    const failed: { row: any; error: string }[] = [];

    for (const row of users) {
      try {
        await authService.register({ ...row, schoolId });
        created++;
      } catch (err: any) {
        failed.push({ row, error: err?.message ?? 'Unknown error' });
      }
    }

    return { created, failed };
  }

  // ── Parent-Student Associations ───────────────────────────────────────────── //
  async getParentAssociations(schoolId: string) {
    return this.db.queryWithTenant(
      schoolId,
      `SELECT psa.*,
              p.first_name as parent_first_name, p.last_name as parent_last_name, p.email as parent_email,
              s.first_name as student_first_name, s.last_name as student_last_name, s.email as student_email
       FROM parent_student_associations psa
       JOIN users p ON p.id = psa.parent_id
       JOIN users s ON s.id = psa.student_id
       WHERE psa.school_id = $1
       ORDER BY p.last_name, s.last_name`,
      [schoolId],
    );
  }

  async createParentAssociation(
    schoolId: string,
    dto: { parentId: string; studentId: string; relationshipType?: string },
  ) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `INSERT INTO parent_student_associations
         (school_id, parent_id, student_id, relationship_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (parent_id, student_id) DO NOTHING
       RETURNING *`,
      [schoolId, dto.parentId, dto.studentId, dto.relationshipType ?? 'GUARDIAN'],
    );
    return rows[0] ?? { message: 'Association already exists' };
  }

  async deleteParentAssociation(schoolId: string, id: string) {
    const rows = await this.db.queryWithTenant(
      schoolId,
      `DELETE FROM parent_student_associations WHERE id = $1 AND school_id = $2 RETURNING id`,
      [id, schoolId],
    );
    if (!rows.length) throw new NotFoundException('Association not found');
    return { deleted: true };
  }

  // ── Dashboard Stats ──────────────────────────────────────────────────────── //
  async getDashboardStats(schoolId: string) {
    const [campuses, classes, sections, users, coursework, enrollments] = await Promise.all([
      this.db.queryWithTenant(schoolId, `SELECT COUNT(*) as count FROM campuses WHERE school_id = $1`, [schoolId]),
      this.db.queryWithTenant(schoolId, `SELECT COUNT(*) as count FROM classes WHERE school_id = $1`, [schoolId]),
      this.db.queryWithTenant(schoolId, `SELECT COUNT(*) as count FROM sections WHERE school_id = $1`, [schoolId]),
      this.db.queryWithTenant(schoolId, `SELECT role, COUNT(*) as count FROM users WHERE school_id = $1 AND is_active = TRUE GROUP BY role`, [schoolId]),
      this.db.queryWithTenant(schoolId, `SELECT COUNT(*) as count FROM coursework WHERE school_id = $1`, [schoolId]),
      this.db.queryWithTenant(schoolId, `SELECT COUNT(*) as count FROM enrollments WHERE school_id = $1`, [schoolId]),
    ]);
    return { campuses: campuses[0], classes: classes[0], sections: sections[0], users, coursework: coursework[0], enrollments: enrollments[0] };
  }
}

