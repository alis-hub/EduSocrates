import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { DatabaseService } from '../database/database.service';

/**
 * Parent portal read-only endpoints.
 * Parents can view progress for their linked children only.
 */
@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentController {
  constructor(private readonly db: DatabaseService) {}

  /** GET /parent/children — list student accounts linked to this parent. */
  @Get('children')
  @Roles('PARENT')
  async getMyChildren(@CurrentUser() user: any) {
    return this.db.queryWithTenant(
      user.schoolId,
      `SELECT psa.student_id, psa.relationship_type,
              u.first_name as student_first_name, u.last_name as student_last_name,
              u.email as student_email
       FROM parent_student_associations psa
       JOIN users u ON u.id = psa.student_id
       WHERE psa.parent_id = $1 AND psa.school_id = $2 AND u.is_active = TRUE
       ORDER BY u.last_name, u.first_name`,
      [user.id, user.schoolId],
    );
  }

  /** GET /parent/children/:studentId/coursework — read-only view of a child's coursework + grades. */
  @Get('children/:studentId/coursework')
  @Roles('PARENT')
  async getChildCoursework(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    // Verify this parent is actually linked to the requested student
    const [link] = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT 1 FROM parent_student_associations
       WHERE parent_id = $1 AND student_id = $2 AND school_id = $3`,
      [user.id, studentId, user.schoolId],
    );
    if (!link) return [];

    return this.db.queryWithTenant(
      user.schoolId,
      `SELECT cw.id, cw.title, cw.description, cw.coursework_type, cw.due_date,
              cw.max_score, cw.ai_guidance_mode,
              sub.name as subject_name, sec.name as section_name,
              s.status as submission_status, s.score, s.submitted_at
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2
       ORDER BY cw.due_date ASC`,
      [studentId, user.schoolId],
    );
  }
}

