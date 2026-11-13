import {
  Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService, PUBLIC_HUB_TENANT_ID } from '../database/database.service';

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: string;
  schoolId: string;
  campusId?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  schoolId: string;
  campusId?: string;
}

export interface PublicSignupDto {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  private buildAuthResponse(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.school_id,
      campusId: user.campus_id,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        schoolId: user.school_id,
        campusId: user.campus_id,
      },
    };
  }

  async login(email: string, password: string): Promise<{ accessToken: string; user: any }> {
    const users = await this.db.query(
      `SELECT u.*, s.id as school_id FROM users u
       JOIN schools s ON s.id = u.school_id
       WHERE u.email = $1 AND u.is_active = true
       LIMIT 1`,
      [email],
    );
    if (!users.length) throw new UnauthorizedException('Invalid credentials');

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.buildAuthResponse(user);
  }

  /**
   * Free Public Hub Sign Up: creates an INDEPENDENT_STUDENT under the Universal Public Hub Tenant
   * and provisions a gamification profile.
   */
  async publicSignup(dto: PublicSignupDto) {
    const existing = await this.db.query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [dto.email],
    );
    if (existing.length) {
      throw new ConflictException('An account with this email already exists. Please sign in.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.db.withTransaction(async (client) => {
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [PUBLIC_HUB_TENANT_ID]);
      const inserted = await client.query(
        `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, NULL, 'INDEPENDENT_STUDENT', $2, $3, $4, $5, TRUE)
         RETURNING *`,
        [PUBLIC_HUB_TENANT_ID, dto.email, passwordHash, dto.firstName, dto.lastName?.trim() || 'Learner'],
      );
      const created = inserted.rows[0];
      await client.query(
        `INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
         VALUES ($1, 1, 1, 25, '["First Spark"]'::jsonb)
         ON CONFLICT (user_id) DO NOTHING`,
        [created.id],
      );
      return created;
    });

    return this.buildAuthResponse(user);
  }

  /**
   * Independent-to-Enrolled Learner Migration (TAD Section 2.2).
   * Redeems an institutional invite code, elevates role/tenancy, enrolls in section if set,
   * and retains all flashcards, quiz attempts, concept progress, and XP.
   */
  async redeemInvite(userId: string, inviteCode: string) {
    const code = inviteCode.trim().toUpperCase();
    const result = await this.db.withTransaction(async (client) => {
      const inviteRes = await client.query(
        `SELECT si.*, s.name as school_name, s.subscription_status
         FROM school_invites si
         JOIN schools s ON s.id = si.school_id
         WHERE UPPER(si.invite_code) = $1`,
        [code],
      );
      if (!inviteRes.rows.length) {
        throw new NotFoundException('Invalid institutional enrollment code.');
      }
      const invite = inviteRes.rows[0];
      if (new Date(invite.expires_at) < new Date()) {
        throw new BadRequestException('This invite code has expired.');
      }
      if (invite.uses_count >= invite.max_uses) {
        throw new BadRequestException('This invite code has reached its usage limit.');
      }
      if (invite.subscription_status === 'SUSPENDED') {
        throw new BadRequestException('Target school subscription is currently suspended.');
      }

      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [invite.school_id]);

      // Elevate tenancy & role while preserving user UUID & all public hub learning data
      const updatedUserRes = await client.query(
        `UPDATE users
         SET school_id = $1,
             campus_id = $2,
             role = $3
         WHERE id = $4
         RETURNING *`,
        [invite.school_id, invite.campus_id, invite.target_role || 'STUDENT', userId],
      );
      if (!updatedUserRes.rows.length) {
        throw new NotFoundException('User account not found.');
      }
      const updatedUser = updatedUserRes.rows[0];

      // Auto-enroll in section if section_id & an active academic year exist
      if (invite.section_id && (invite.target_role || 'STUDENT') === 'STUDENT') {
        const ayRes = await client.query(
          `SELECT id FROM academic_years WHERE school_id = $1 AND is_active = TRUE ORDER BY start_date DESC LIMIT 1`,
          [invite.school_id],
        );
        if (ayRes.rows.length) {
          await client.query(
            `INSERT INTO enrollments (school_id, student_id, section_id, academic_year_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id, section_id, academic_year_id) DO NOTHING`,
            [invite.school_id, userId, invite.section_id, ayRes.rows[0].id],
          );
        }
      }

      await client.query(
        `UPDATE school_invites SET uses_count = uses_count + 1 WHERE id = $1`,
        [invite.id],
      );

      return { updatedUser, schoolName: invite.school_name };
    });

    return {
      ...this.buildAuthResponse(result.updatedUser),
      schoolName: result.schoolName,
      migrated: true,
    };
  }

  async register(dto: RegisterDto): Promise<{ id: string; email: string; role: string }> {
    const schools = await this.db.query(
      `SELECT id FROM schools WHERE id = $1 AND subscription_status IN ('ACTIVE', 'TRIAL')`,
      [dto.schoolId],
    );
    if (!schools.length) {
      throw new BadRequestException('School not found or inactive. Contact your administrator.');
    }

    const existing = await this.db.query(
      `SELECT id FROM users WHERE school_id = $1 AND email = $2`,
      [dto.schoolId, dto.email],
    );
    if (existing.length) {
      throw new ConflictException('A user with this email already exists in this school.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const rows = await this.db.queryWithTenant(
      dto.schoolId,
      `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, email, role`,
      [
        dto.schoolId,
        dto.campusId || null,
        dto.role,
        dto.email,
        passwordHash,
        dto.firstName,
        dto.lastName,
      ],
    );
    return rows[0];
  }

  /**
   * Single Sign-On (Google & LinkedIn).
   * Maps incoming email domain to the corresponding school tenant in PostgreSQL,
   * or defaults to Universal Public Hub tenant if domain is unmapped or public.
   */
  async ssoLogin(dto: {
    provider: 'google' | 'linkedin';
    email: string;
    firstName?: string;
    lastName?: string;
  }) {
    const email = dto.email.trim().toLowerCase();

    // Check if user already exists
    const existing = await this.db.query(
      `SELECT u.*, s.id as school_id FROM users u
       JOIN schools s ON s.id = u.school_id
       WHERE LOWER(u.email) = $1 AND u.is_active = true
       LIMIT 1`,
      [email],
    );

    if (existing.length) {
      return this.buildAuthResponse(existing[0]);
    }

    // Determine tenant domain routing
    const domain = email.includes('@') ? email.split('@')[1] : '';
    let targetSchoolId = PUBLIC_HUB_TENANT_ID;
    let targetCampusId: string | null = null;
    let role = 'INDEPENDENT_STUDENT';

    if (
      domain &&
      domain !== 'gmail.com' &&
      domain !== 'googlemail.com' &&
      domain !== 'yahoo.com' &&
      domain !== 'outlook.com' &&
      domain !== 'hotmail.com'
    ) {
      const matchedSchool = await this.db.query(
        `SELECT s.id, c.id as default_campus_id FROM schools s
         LEFT JOIN campuses c ON c.school_id = s.id
         WHERE LOWER(s.domain) = $1 AND s.subscription_status IN ('ACTIVE', 'TRIAL')
         LIMIT 1`,
        [domain.toLowerCase()],
      );
      if (matchedSchool.length) {
        targetSchoolId = matchedSchool[0].id;
        targetCampusId = matchedSchool[0].default_campus_id || null;
        if (
          dto.provider === 'linkedin' ||
          email.includes('teacher') ||
          email.includes('faculty') ||
          email.includes('prof')
        ) {
          role = 'TEACHER';
        } else {
          role = 'STUDENT';
        }
      }
    }

    const firstName = dto.firstName?.trim() || email.split('@')[0] || 'User';
    const lastName = dto.lastName?.trim() || (role === 'INDEPENDENT_STUDENT' ? 'Learner' : '');
    const randomPass = await bcrypt.hash(`sso_${Math.random()}_${Date.now()}`, 10);

    const user = await this.db.withTransaction(async (client) => {
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [targetSchoolId]);
      const ins = await client.query(
        `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         RETURNING *`,
        [targetSchoolId, targetCampusId, role, email, randomPass, firstName, lastName],
      );
      const created = ins.rows[0];

      if (role === 'STUDENT' || role === 'INDEPENDENT_STUDENT') {
        await client.query(
          `INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
           VALUES ($1, 1, 1, 30, '["SSO Pioneer"]'::jsonb)
           ON CONFLICT (user_id) DO NOTHING`,
          [created.id],
        );
      }
      return created;
    });

    return {
      ...this.buildAuthResponse(user),
      tenantRouted: targetSchoolId !== PUBLIC_HUB_TENANT_ID,
      provider: dto.provider,
    };
  }
}
