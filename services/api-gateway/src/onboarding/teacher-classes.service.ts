import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OnboardingService, ClassInput } from './onboarding.service';

interface Actor { id: string; schoolId: string; campusId?: string | null; role: string }

@Injectable()
export class TeacherClassesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly onboarding: OnboardingService,
  ) {}

  private async isTutorTenant(schoolId: string): Promise<boolean> {
    const rows = await this.db.queryWithTenant(schoolId, `SELECT tenant_type FROM schools WHERE id = $1`, [schoolId]);
    return rows[0]?.tenant_type === 'TUTOR';
  }

  canCreateClasses(schoolId: string) {
    return this.isTutorTenant(schoolId);
  }

  /** A teacher can manage a section if they own the academy, or are allocated to it. */
  private async assertCanManageSection(actor: Actor, sectionId: string) {
    if (await this.isTutorTenant(actor.schoolId)) {
      const own = await this.db.queryWithTenant(
        actor.schoolId, `SELECT 1 FROM sections WHERE id = $1 AND school_id = $2`, [sectionId, actor.schoolId],
      );
      if (!own.length) throw new NotFoundException('Class not found');
      return;
    }
    const alloc = await this.db.queryWithTenant(
      actor.schoolId,
      `SELECT 1 FROM teacher_subject_allocations WHERE teacher_id = $1 AND section_id = $2 AND school_id = $3 LIMIT 1`,
      [actor.id, sectionId, actor.schoolId],
    );
    if (!alloc.length) throw new NotFoundException('Class not found');
  }

  async list(actor: Actor) {
    const tutor = await this.isTutorTenant(actor.schoolId);
    return this.db.queryWithTenant(
      actor.schoolId,
      `SELECT sec.id AS "sectionId", sec.name AS "sectionName",
              c.id AS "classId", c.name AS "className", c.grade_level AS "gradeLevel",
              sub.id AS "subjectId", sub.name AS "subjectName",
              (SELECT COUNT(DISTINCT e.student_id) FROM enrollments e WHERE e.section_id = sec.id)::int AS "studentCount",
              (SELECT json_build_object('code', si.invite_code, 'expiresAt', si.expires_at,
                                        'usesCount', si.uses_count, 'maxUses', si.max_uses)
                 FROM school_invites si
                WHERE si.section_id = sec.id AND si.target_role = 'STUDENT'
                  AND si.expires_at > NOW() AND si.uses_count < si.max_uses
                ORDER BY si.created_at DESC LIMIT 1) AS "joinCode"
       FROM sections sec
       JOIN classes c ON c.id = sec.class_id
       JOIN subjects sub ON sub.class_id = c.id
       WHERE sec.school_id = $1
         AND ($3::boolean OR EXISTS (
               SELECT 1 FROM teacher_subject_allocations a
                WHERE a.teacher_id = $2 AND a.section_id = sec.id AND a.subject_id = sub.id))
       ORDER BY c.name, sub.name, sec.name`,
      [actor.schoolId, actor.id, tutor],
    );
  }

  /** Independent teachers add their own classes. In a school, the administrator does that. */
  async create(actor: Actor, input: ClassInput & { campusName?: string }) {
    if (!(await this.isTutorTenant(actor.schoolId))) {
      throw new ForbiddenException('Ask your school administrator to add classes.');
    }
    return this.db.withTenantTransaction(actor.schoolId, async (client) => {
      const campus = (await client.query(
        `SELECT id FROM campuses WHERE school_id = $1 ORDER BY created_at ASC LIMIT 1`, [actor.schoolId],
      )).rows[0];
      if (!campus) throw new NotFoundException('No campus found for this academy.');
      return this.onboarding.provisionClass(client, {
        schoolId: actor.schoolId, campusId: campus.id, teacherId: actor.id, input,
      });
    });
  }

  /** New code for a class; every older active code stops working. */
  async rotateCode(actor: Actor, sectionId: string) {
    await this.assertCanManageSection(actor, sectionId);
    return this.db.withTenantTransaction(actor.schoolId, async (client) => {
      const campus = (await client.query(`SELECT campus_id FROM users WHERE id = $1`, [actor.id])).rows[0];
      await client.query(
        `UPDATE school_invites SET expires_at = NOW()
         WHERE section_id = $1 AND school_id = $2 AND target_role = 'STUDENT' AND expires_at > NOW()`,
        [sectionId, actor.schoolId],
      );
      return this.onboarding.createJoinCode(client, {
        schoolId: actor.schoolId, campusId: campus?.campus_id ?? null, sectionId, createdBy: actor.id,
      });
    });
  }

  async revokeCode(actor: Actor, sectionId: string) {
    await this.assertCanManageSection(actor, sectionId);
    await this.db.queryWithTenant(
      actor.schoolId,
      `UPDATE school_invites SET expires_at = NOW()
       WHERE section_id = $1 AND school_id = $2 AND target_role = 'STUDENT' AND expires_at > NOW()`,
      [sectionId, actor.schoolId],
    );
    return { success: true, message: 'The class code no longer works. Create a new one when you are ready.' };
  }

  async students(actor: Actor, sectionId: string) {
    await this.assertCanManageSection(actor, sectionId);
    return this.db.queryWithTenant(
      actor.schoolId,
      `SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email, e.created_at AS "joinedAt"
       FROM enrollments e JOIN users u ON u.id = e.student_id
       WHERE e.section_id = $1 AND e.school_id = $2
       ORDER BY u.first_name, u.last_name`,
      [sectionId, actor.schoolId],
    );
  }

  async removeStudent(actor: Actor, sectionId: string, studentId: string) {
    await this.assertCanManageSection(actor, sectionId);
    const rows = await this.db.queryWithTenant(
      actor.schoolId,
      `DELETE FROM enrollments WHERE section_id = $1 AND student_id = $2 AND school_id = $3 RETURNING id`,
      [sectionId, studentId, actor.schoolId],
    );
    if (!rows.length) throw new NotFoundException('That student is not in this class.');
    return { success: true };
  }
}
