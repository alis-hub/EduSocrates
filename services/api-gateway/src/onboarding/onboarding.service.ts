import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import type { PoolClient } from 'pg';
import { DatabaseService } from '../database/database.service';
import { AuthService } from '../auth/auth.service';
import { normalizeEmail } from '../common/security';
import { generateJoinCode, normalizeJoinCode } from '../common/join-code';

const CODE_LIFETIME_DAYS = 365;
const DEFAULT_MAX_STUDENTS = 100;

function slugify(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'academy';
  return `${base}-${crypto.randomBytes(3).toString('hex')}`;
}

function shortCode(text: string, fallback: string, max: number): string {
  return text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, max) || fallback;
}

export interface ClassInput {
  className: string;
  gradeLevel: number;
  subjectName: string;
  sectionName?: string;
}

@Injectable()
export class OnboardingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly auth: AuthService,
  ) {}

  // ─── Shared building blocks (run inside a tenant transaction) ─────────────

  private async setTenant(client: PoolClient, schoolId: string) {
    await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [schoolId]);
  }

  private async ensureActiveYear(client: PoolClient, schoolId: string): Promise<string> {
    const found = await client.query(
      `SELECT id FROM academic_years WHERE school_id = $1 AND is_active = TRUE ORDER BY start_date DESC LIMIT 1`,
      [schoolId],
    );
    if (found.rows.length) return found.rows[0].id;
    const y = new Date().getFullYear();
    const created = await client.query(
      `INSERT INTO academic_years (school_id, name, start_date, end_date, is_active)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year', TRUE) RETURNING id`,
      [schoolId, `${y}-${y + 1}`],
    );
    return created.rows[0].id;
  }

  /** A fresh, unguessable student join code for a section. Any older active code keeps working until rotated. */
  async createJoinCode(
    client: PoolClient,
    p: { schoolId: string; campusId: string | null; sectionId: string; createdBy: string; maxUses?: number },
  ) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateJoinCode();
      const clash = await client.query(
        `SELECT 1 FROM school_invites WHERE REPLACE(UPPER(invite_code), '-', '') = $1`,
        [normalizeJoinCode(code)],
      );
      if (clash.rows.length) continue;
      const res = await client.query(
        `INSERT INTO school_invites
           (school_id, campus_id, section_id, invite_code, target_role, created_by, max_uses, expires_at)
         VALUES ($1, $2, $3, $4, 'STUDENT', $5, $6, NOW() + ($7 || ' days')::interval)
         RETURNING invite_code, expires_at, uses_count, max_uses`,
        [p.schoolId, p.campusId, p.sectionId, code, p.createdBy, p.maxUses ?? DEFAULT_MAX_STUDENTS, String(CODE_LIFETIME_DAYS)],
      );
      const r = res.rows[0];
      return { code: r.invite_code, expiresAt: r.expires_at, usesCount: r.uses_count, maxUses: r.max_uses };
    }
    throw new ConflictException('Could not generate a unique class code. Please try again.');
  }

  /** class → section → subject → teacher allocation → join code. Reuses a class/subject that already exists. */
  async provisionClass(
    client: PoolClient,
    p: { schoolId: string; campusId: string; teacherId: string; input: ClassInput },
  ) {
    const { schoolId, campusId, teacherId, input } = p;
    const className = input.className.trim();
    const subjectName = input.subjectName.trim();
    const sectionName = (input.sectionName?.trim() || subjectName).slice(0, 64);

    let cls = (await client.query(
      `SELECT id, name, code, grade_level FROM classes WHERE school_id = $1 AND campus_id = $2 AND LOWER(name) = LOWER($3) LIMIT 1`,
      [schoolId, campusId, className],
    )).rows[0];
    if (!cls) {
      cls = (await client.query(
        `INSERT INTO classes (school_id, campus_id, name, code, grade_level) VALUES ($1,$2,$3,$4,$5)
         RETURNING id, name, code, grade_level`,
        [schoolId, campusId, className, shortCode(className, `G${input.gradeLevel}`, 12), input.gradeLevel],
      )).rows[0];
    }

    let section = (await client.query(
      `SELECT id, name FROM sections WHERE school_id = $1 AND class_id = $2 AND LOWER(name) = LOWER($3) LIMIT 1`,
      [schoolId, cls.id, sectionName],
    )).rows[0];
    if (!section) {
      section = (await client.query(
        `INSERT INTO sections (school_id, class_id, name) VALUES ($1,$2,$3) RETURNING id, name`,
        [schoolId, cls.id, sectionName],
      )).rows[0];
    }

    let subject = (await client.query(
      `SELECT id, name FROM subjects WHERE school_id = $1 AND class_id = $2 AND LOWER(name) = LOWER($3) LIMIT 1`,
      [schoolId, cls.id, subjectName],
    )).rows[0];
    if (!subject) {
      subject = (await client.query(
        `INSERT INTO subjects (school_id, class_id, name, code) VALUES ($1,$2,$3,$4) RETURNING id, name`,
        [schoolId, cls.id, subjectName, shortCode(subjectName, 'SUBJ', 10)],
      )).rows[0];
    }

    const alloc = await client.query(
      `SELECT 1 FROM teacher_subject_allocations WHERE school_id = $1 AND teacher_id = $2 AND subject_id = $3 AND section_id = $4`,
      [schoolId, teacherId, subject.id, section.id],
    );
    if (!alloc.rows.length) {
      await client.query(
        `INSERT INTO teacher_subject_allocations (school_id, teacher_id, subject_id, section_id) VALUES ($1,$2,$3,$4)`,
        [schoolId, teacherId, subject.id, section.id],
      );
    }

    const active = await client.query(
      `SELECT invite_code, expires_at, uses_count, max_uses FROM school_invites
       WHERE section_id = $1 AND target_role = 'STUDENT' AND expires_at > NOW() AND uses_count < max_uses
       ORDER BY created_at DESC LIMIT 1`,
      [section.id],
    );
    const joinCode = active.rows.length
      ? { code: active.rows[0].invite_code, expiresAt: active.rows[0].expires_at, usesCount: active.rows[0].uses_count, maxUses: active.rows[0].max_uses }
      : await this.createJoinCode(client, { schoolId, campusId, sectionId: section.id, createdBy: teacherId });

    return { class: cls, section, subject, joinCode };
  }

  // ─── Schools: the shortest possible path ──────────────────────────────────

  async createSchool(dto: {
    schoolName: string; city?: string;
    adminFirstName: string; adminLastName: string; adminEmail: string; adminPassword: string;
  }) {
    const email = normalizeEmail(dto.adminEmail);
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    const { school, admin } = await this.db.withTransaction(async (client) => {
      const school = (await client.query(
        `INSERT INTO schools (slug, name, subscription_status, is_public_hub, tenant_type)
         VALUES ($1, $2, 'ACTIVE', FALSE, 'SCHOOL') RETURNING id, name, slug`,
        [slugify(dto.schoolName), dto.schoolName.trim()],
      )).rows[0];
      await this.setTenant(client, school.id);

      // Campuses are a detail most schools never think about: every school gets one, quietly.
      const campus = (await client.query(
        `INSERT INTO campuses (school_id, name, address) VALUES ($1, 'Main Campus', $2) RETURNING id`,
        [school.id, dto.city?.trim() || null],
      )).rows[0];

      const admin = (await client.query(
        `INSERT INTO users (school_id, campus_id, email, password_hash, first_name, last_name, role)
         VALUES ($1,$2,$3,$4,$5,$6,'SCHOOL_ADMIN') RETURNING *`,
        [school.id, campus.id, email, passwordHash, dto.adminFirstName.trim(), dto.adminLastName.trim()],
      )).rows[0];
      await client.query(`UPDATE schools SET owner_user_id = $1 WHERE id = $2`, [admin.id, school.id]);
      await this.ensureActiveYear(client, school.id);
      return { school, admin };
    });

    // Administrators set up an authenticator app before they get a session.
    void this.auth.sendVerificationEmail(admin);
    const session = await this.auth.completeSignIn(admin);
    return { ...session, school: { id: school.id, name: school.name } };
  }

  // ─── Independent tutors / academies ───────────────────────────────────────

  async createTutor(dto: {
    firstName: string; lastName: string; email: string; password: string;
    academyName: string; className: string; gradeLevel: number; subjectName: string;
    sectionName?: string; campusName?: string; city?: string;
  }) {
    const email = normalizeEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const out = await this.db.withTransaction(async (client) => {
      const school = (await client.query(
        `INSERT INTO schools (slug, name, subscription_status, is_public_hub, tenant_type)
         VALUES ($1, $2, 'ACTIVE', FALSE, 'TUTOR') RETURNING id, name, slug`,
        [slugify(dto.academyName), dto.academyName.trim()],
      )).rows[0];
      await this.setTenant(client, school.id);

      const campus = (await client.query(
        `INSERT INTO campuses (school_id, name, address) VALUES ($1, $2, $3) RETURNING id, name`,
        [school.id, dto.campusName?.trim() || 'Main', dto.city?.trim() || null],
      )).rows[0];

      const teacher = (await client.query(
        `INSERT INTO users (school_id, campus_id, email, password_hash, first_name, last_name, role)
         VALUES ($1,$2,$3,$4,$5,$6,'TEACHER') RETURNING *`,
        [school.id, campus.id, email, passwordHash, dto.firstName.trim(), dto.lastName.trim()],
      )).rows[0];
      await client.query(`UPDATE schools SET owner_user_id = $1 WHERE id = $2`, [teacher.id, school.id]);
      await this.ensureActiveYear(client, school.id);

      const provisioned = await this.provisionClass(client, {
        schoolId: school.id, campusId: campus.id, teacherId: teacher.id,
        input: { className: dto.className, gradeLevel: dto.gradeLevel, subjectName: dto.subjectName, sectionName: dto.sectionName },
      });
      return { school, teacher, provisioned };
    });

    void this.auth.sendVerificationEmail(out.teacher);
    return {
      ...this.auth.buildAuthResponse(out.teacher),
      school: { id: out.school.id, name: out.school.name },
      provisioned: out.provisioned,
    };
  }

  // ─── Students joining with a class code ───────────────────────────────────

  /** Reads and validates a code under a row lock. Runs on the owner connection: the school is not known yet. */
  private async lockInvite(client: PoolClient, rawCode: string) {
    const code = normalizeJoinCode(rawCode);
    if (code.length < 6) throw new NotFoundException('That class code was not found. Check it and try again.');
    const res = await client.query(
      `SELECT si.*, s.name AS school_name, s.subscription_status, c.name AS class_name, c.grade_level, sec.name AS section_name
       FROM school_invites si
       JOIN schools s ON s.id = si.school_id
       LEFT JOIN sections sec ON sec.id = si.section_id
       LEFT JOIN classes c ON c.id = sec.class_id
       WHERE REPLACE(UPPER(si.invite_code), '-', '') = $1
       FOR UPDATE OF si`,
      [code],
    );
    const inv = res.rows[0];
    if (!inv || inv.target_role !== 'STUDENT' || !inv.section_id) {
      throw new NotFoundException('That class code was not found. Check it and try again.');
    }
    if (new Date(inv.expires_at) < new Date()) throw new BadRequestException('This class code has expired. Ask your teacher for a new one.');
    if (inv.uses_count >= inv.max_uses) throw new BadRequestException('This class is full. Ask your teacher for help.');
    if (inv.subscription_status === 'SUSPENDED') throw new BadRequestException('This class is not accepting students right now.');
    return inv;
  }

  private async enroll(client: PoolClient, schoolId: string, studentId: string, sectionId: string): Promise<boolean> {
    const year = await this.ensureActiveYear(client, schoolId);
    const r = await client.query(
      `INSERT INTO enrollments (school_id, student_id, section_id, academic_year_id)
       VALUES ($1,$2,$3,$4) ON CONFLICT (student_id, section_id, academic_year_id) DO NOTHING RETURNING id`,
      [schoolId, studentId, sectionId, year],
    );
    return r.rows.length > 0;
  }

  /** New student: creates the account in the class's school and enrols it in one step. */
  async joinClassNewStudent(dto: { code: string; firstName: string; lastName: string; email: string; password: string }) {
    const email = normalizeEmail(dto.email);
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const out = await this.db.withTransaction(async (client) => {
        const inv = await this.lockInvite(client, dto.code);
        await this.setTenant(client, inv.school_id);
        const user = (await client.query(
          `INSERT INTO users (school_id, campus_id, email, password_hash, first_name, last_name, role)
           VALUES ($1,$2,$3,$4,$5,$6,'STUDENT') RETURNING *`,
          [inv.school_id, inv.campus_id, email, passwordHash, dto.firstName.trim(), dto.lastName.trim()],
        )).rows[0];
        await this.enroll(client, inv.school_id, user.id, inv.section_id);
        await client.query(`UPDATE school_invites SET uses_count = uses_count + 1 WHERE id = $1`, [inv.id]);
        return { user, inv };
      });
      void this.auth.sendVerificationEmail(out.user);
      return {
        ...this.auth.buildAuthResponse(out.user),
        joined: { schoolName: out.inv.school_name, className: out.inv.class_name, sectionName: out.inv.section_name },
      };
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new ConflictException('You already have an account here. Sign in, then use "Join a class" with this code.');
      }
      throw err;
    }
  }

  /** Existing student of the same school adds another class. */
  async joinClassExistingStudent(user: { id: string; schoolId: string }, rawCode: string) {
    return this.db.withTransaction(async (client) => {
      const inv = await this.lockInvite(client, rawCode);
      if (inv.school_id !== user.schoolId) {
        throw new ForbiddenException('This code belongs to a different school or academy. Join it with a separate account.');
      }
      await this.setTenant(client, inv.school_id);
      const added = await this.enroll(client, inv.school_id, user.id, inv.section_id);
      if (added) await client.query(`UPDATE school_invites SET uses_count = uses_count + 1 WHERE id = $1`, [inv.id]);
      return { joined: { schoolName: inv.school_name, className: inv.class_name, sectionName: inv.section_name }, alreadyEnrolled: !added };
    });
  }
}
