import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Actor { id: string; role: string; schoolId: string }

/** School admins manage everything in their school. Teachers only what they own or are assigned to. */
export async function assertCanTeachSection(db: DatabaseService, a: Actor, sectionId: string, subjectId?: string) {
  if (a.role === 'SCHOOL_ADMIN') {
    const ok = await db.queryWithTenant(
      a.schoolId,
      `SELECT 1 FROM sections WHERE id = $1 AND school_id = $2`, [sectionId, a.schoolId]);
    if (!ok.length) throw new NotFoundException('Section not found.');
    return;
  }
  const rows = await db.queryWithTenant(
    a.schoolId,
    `SELECT 1 FROM teacher_subject_allocations
     WHERE teacher_id = $1 AND school_id = $2 AND section_id = $3
       AND ($4::uuid IS NULL OR subject_id = $4::uuid)`,
    [a.id, a.schoolId, sectionId, subjectId ?? null],
  );
  if (!rows.length) throw new ForbiddenException('You are not assigned to this class and subject.');
}

/** The coursework's creator, a teacher assigned to its section, or a school admin. Returns the coursework row. */
export async function assertCanManageCoursework(db: DatabaseService, a: Actor, courseworkId: string) {
  const rows = await db.queryWithTenant(
    a.schoolId,
    `SELECT cw.id, cw.creator_id, cw.section_id,
            EXISTS (SELECT 1 FROM teacher_subject_allocations t
                    WHERE t.teacher_id = $3 AND t.school_id = cw.school_id AND t.section_id = cw.section_id) AS assigned
     FROM coursework cw WHERE cw.id = $1 AND cw.school_id = $2`,
    [courseworkId, a.schoolId, a.id],
  );
  if (!rows.length) throw new NotFoundException('Coursework not found.');
  const cw = rows[0];
  if (a.role !== 'SCHOOL_ADMIN' && cw.creator_id !== a.id && !cw.assigned) {
    throw new ForbiddenException('This coursework belongs to another teacher.');
  }
  return cw;
}
