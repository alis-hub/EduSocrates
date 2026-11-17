import {
  Injectable, UnauthorizedException, BadRequestException, ConflictException,
  NotFoundException, ForbiddenException, ServiceUnavailableException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService, PUBLIC_HUB_TENANT_ID } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { isDemoMode, isLockedSeedAccount, normalizeEmail } from '../common/security';
import { generateTotpSecret, otpauthUrl, verifyTotp } from './totp';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  schoolId: string;
  campusId?: string;
  typ?: 'access';
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

/** Roles an administrator may create inside their own school. SUPER_ADMIN can never be created through the API. */
export const REGISTERABLE_ROLES = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'];
const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'SCHOOL_ADMIN']);
const DUMMY_HASH = bcrypt.hashSync('timing-equalisation-dummy-password', 10);
const FIFTEEN_MIN = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  // ─── Token helpers ────────────────────────────────────────────────────────

  public buildAuthResponse(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      schoolId: user.school_id,
      campusId: user.campus_id,
      typ: 'access',
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

  private signTemp(userId: string, typ: 'mfa' | 'mfa_setup') {
    return this.jwtService.sign({ sub: userId, typ }, { expiresIn: '5m' });
  }

  private readTemp(token: string, typ: 'mfa' | 'mfa_setup'): string {
    let payload: any;
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Verification session expired. Please sign in again.');
    }
    if (payload?.typ !== typ || !payload?.sub) {
      throw new UnauthorizedException('Invalid verification token.');
    }
    return payload.sub as string;
  }

  private async getActiveUserById(id: string) {
    const rows = await this.db.query(
      `SELECT u.* FROM users u JOIN schools s ON s.id = u.school_id
       WHERE u.id = $1 AND u.is_active = TRUE AND s.subscription_status <> 'SUSPENDED'`,
      [id],
    );
    if (!rows.length) throw new UnauthorizedException('Account not found.');
    return rows[0];
  }

  // ─── Login + MFA ──────────────────────────────────────────────────────────

  async login(email: string, password: string, mfaCode?: string, schoolId?: string): Promise<any> {
    const normalized = normalizeEmail(email);
    await this.redis.checkAndIncrementQuota(
      `login:${normalized}`, FIFTEEN_MIN, 20,
      'Too many sign-in attempts for this account. Please try again in 15 minutes.',
    );

    const users = await this.db.query(
      `SELECT u.*, s.name AS school_name, s.tenant_type FROM users u JOIN schools s ON s.id = u.school_id
       WHERE LOWER(u.email) = $1 AND u.is_active = TRUE AND s.subscription_status <> 'SUSPENDED'
       ORDER BY u.created_at ASC LIMIT 10`,
      [normalized],
    );

    // The same email may exist in several schools: find every account this password opens.
    const matches: any[] = [];
    for (const u of users) {
      if (isLockedSeedAccount(u.password_hash, this.config)) {
        this.logger.warn(`Blocked sign-in to ${u.email}: still uses the published seed password. Run database/production/lock_seed_accounts.sql.`);
        continue;
      }
      if (await bcrypt.compare(password, u.password_hash)) matches.push(u);
    }
    if (!users.length) await bcrypt.compare(password, DUMMY_HASH); // equalise timing
    if (!matches.length) throw new UnauthorizedException('Invalid credentials');

    let matched = matches[0];
    if (matches.length > 1) {
      const chosen = schoolId ? matches.find((m) => m.school_id === schoolId) : undefined;
      if (!chosen) {
        // Password proven, but the person belongs to several schools/academies: let them choose.
        return {
          requiresAccountChoice: true,
          accounts: matches.map((m) => ({
            schoolId: m.school_id,
            schoolName: m.school_name,
            role: m.role,
            tenantType: m.tenant_type,
          })),
          message: 'You have more than one account with this email. Choose where to sign in.',
        };
      }
      matched = chosen;
    }
    return this.completeSignIn(matched, mfaCode);
  }

  /** Password already verified: apply the administrator second-factor rules and issue the session. */
  public async completeSignIn(matched: any, mfaCode?: string): Promise<any> {
    if (!ADMIN_ROLES.has(matched.role)) return this.buildAuthResponse(matched);

    // Administrators need a real second factor (TOTP).
    if (matched.mfa_enabled && matched.mfa_secret) {
      if (mfaCode) return this.finishMfa(matched, mfaCode);
      return {
        requiresMfa: true,
        tempToken: this.signTemp(matched.id, 'mfa'),
        email: matched.email,
        role: matched.role,
        message: 'Enter the 6-digit code from your authenticator app.',
      };
    }
    if (isDemoMode(this.config)) {
      this.logger.warn(`Demo mode: administrator ${matched.email} signed in WITHOUT MFA.`);
      return this.buildAuthResponse(matched);
    }
    return {
      requiresMfaSetup: true,
      tempToken: this.signTemp(matched.id, 'mfa_setup'),
      email: matched.email,
      role: matched.role,
      message: 'Administrator accounts must set up an authenticator app before signing in.',
    };
  }

  private async finishMfa(user: any, code: string) {
    await this.redis.checkAndIncrementQuota(
      `mfa:${user.id}`, 5 * 60 * 1000, 8, 'Too many MFA attempts. Please wait a few minutes.',
    );
    const step = verifyTotp(user.mfa_secret, String(code ?? '').trim());
    if (step === null) throw new UnauthorizedException('Invalid or expired verification code.');
    if (user.mfa_last_step && step <= Number(user.mfa_last_step)) {
      throw new UnauthorizedException('This code was already used. Wait for the next one.');
    }
    await this.db.query(`UPDATE users SET mfa_last_step = $1 WHERE id = $2`, [step, user.id]);
    return this.buildAuthResponse(user);
  }

  async verifyMfa(tempToken: string, code: string) {
    const userId = this.readTemp(tempToken, 'mfa');
    const user = await this.getActiveUserById(userId);
    if (!user.mfa_enabled || !user.mfa_secret) throw new UnauthorizedException('MFA is not enabled.');
    return this.finishMfa(user, code);
  }

  /** Step 1 of authenticator enrolment: returns a fresh secret + otpauth:// URL (render as QR on the client). */
  async mfaSetupStart(tempToken: string) {
    const userId = this.readTemp(tempToken, 'mfa_setup');
    const user = await this.getActiveUserById(userId);
    const secret = generateTotpSecret();
    await this.redis.set(`mfa_pending:${userId}`, secret, 600);
    return { secret, otpauthUrl: otpauthUrl(secret, user.email), expiresInSeconds: 600 };
  }

  /** Step 2: user proves the app works by entering a code; then the secret is stored and they are signed in. */
  async mfaSetupConfirm(tempToken: string, code: string) {
    const userId = this.readTemp(tempToken, 'mfa_setup');
    const user = await this.getActiveUserById(userId);
    const secret = await this.redis.get<string>(`mfa_pending:${userId}`);
    if (!secret) throw new BadRequestException('Setup session expired. Start the setup again.');
    await this.redis.checkAndIncrementQuota(
      `mfa:${userId}`, 5 * 60 * 1000, 8, 'Too many MFA attempts. Please wait a few minutes.',
    );
    const step = verifyTotp(secret, String(code ?? '').trim());
    if (step === null) throw new UnauthorizedException('Invalid code. Check your authenticator app and try again.');
    await this.db.query(
      `UPDATE users SET mfa_secret = $1, mfa_enabled = TRUE, mfa_last_step = $2 WHERE id = $3`,
      [secret, step, userId],
    );
    await this.redis.del(`mfa_pending:${userId}`);
    return this.buildAuthResponse(user);
  }

  // ─── Recovery / sessions ──────────────────────────────────────────────────

  /** Always returns the same response (no account enumeration). Email delivery is not wired up yet. */
  async requestRecovery(email: string) {
    this.logger.log(`Password recovery requested (email delivery not configured): ${normalizeEmail(email).replace(/(.).+(@.+)/, '$1***$2')}`);
    return {
      success: true,
      message: 'If an active account exists for this address, password recovery instructions have been sent.',
    };
  }

  /** Invalidates every token issued before now and hands back a fresh token for the calling device. */
  async revokeOtherSessions(userId: string) {
    const nowSec = Math.floor(Date.now() / 1000);
    await this.redis.set(`rv:${userId}`, nowSec * 1000, 60 * 60 * 24 * 30);
    const user = await this.getActiveUserById(userId);
    return {
      success: true,
      message: 'All other sessions have been signed out.',
      revokedAt: new Date().toISOString(),
      ...this.buildAuthResponse(user),
    };
  }

  // ─── Public sign-up (independent learners) ────────────────────────────────

  async publicSignup(dto: PublicSignupDto) {
    const email = normalizeEmail(dto.email);
    const existing = await this.db.query(`SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1`, [email]);
    if (existing.length) {
      throw new ConflictException('An account with this email already exists. Please sign in.');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    let user: any;
    try {
      user = await this.db.withTransaction(async (client) => {
        await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [PUBLIC_HUB_TENANT_ID]);
        const inserted = await client.query(
          `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
           VALUES ($1, NULL, 'INDEPENDENT_STUDENT', $2, $3, $4, $5, TRUE)
           RETURNING *`,
          [PUBLIC_HUB_TENANT_ID, email, passwordHash, dto.firstName.trim(), dto.lastName?.trim() || 'Learner'],
        );
        const created = inserted.rows[0];
        await client.query(
          `INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
           VALUES ($1, 1, 1, 25, '["First Spark"]'::jsonb) ON CONFLICT (user_id) DO NOTHING`,
          [created.id],
        );
        return created;
      });
    } catch (err: any) {
      if (err?.code === '23505') throw new ConflictException('An account with this email already exists. Please sign in.');
      throw err;
    }
    return this.buildAuthResponse(user);
  }

  // ─── Joining a school with an invite code ─────────────────────────────────

  // ─── Single sign-on (Google ID token, verified server-side) ───────────────

  async ssoLogin(dto: { provider: string; idToken: string }) {
    if (dto.provider !== 'google') throw new BadRequestException('Only Google sign-in is supported.');
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) throw new ServiceUnavailableException('Google sign-in is not configured on this server.');

    let claims: any;
    try {
      const resp = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(dto.idToken)}`,
      );
      if (!resp.ok) throw new Error(`tokeninfo ${resp.status}`);
      claims = await resp.json();
    } catch {
      throw new UnauthorizedException('Google sign-in could not be verified.');
    }
    const issOk = claims.iss === 'https://accounts.google.com' || claims.iss === 'accounts.google.com';
    if (claims.aud !== clientId || !issOk || String(claims.email_verified) !== 'true' || !claims.email) {
      throw new UnauthorizedException('Google sign-in could not be verified.');
    }
    const email = normalizeEmail(claims.email);

    const existing = await this.db.query(
      `SELECT u.* FROM users u JOIN schools s ON s.id = u.school_id
       WHERE LOWER(u.email) = $1 AND u.is_active = TRUE AND s.subscription_status <> 'SUSPENDED'
       ORDER BY u.created_at ASC`,
      [email],
    );
    // Administrators must use password + MFA; SSO can never sign into an admin account.
    const usable = existing.find((u: any) => !ADMIN_ROLES.has(u.role));
    if (existing.length && !usable) {
      throw new ForbiddenException('Administrator accounts must sign in with email, password and MFA.');
    }
    if (usable) return { ...this.buildAuthResponse(usable), provider: 'google' };

    // New users are always independent learners. Role/tenant is never inferred from an email address.
    const randomPass = await bcrypt.hash(`sso_${cryptoRandom()}`, 10);
    const user = await this.db.withTransaction(async (client) => {
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [PUBLIC_HUB_TENANT_ID]);
      const ins = await client.query(
        `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, NULL, 'INDEPENDENT_STUDENT', $2, $3, $4, $5, TRUE) RETURNING *`,
        [
          PUBLIC_HUB_TENANT_ID, email, randomPass,
          String(claims.given_name || email.split('@')[0] || 'Learner').slice(0, 100),
          String(claims.family_name || 'Learner').slice(0, 100),
        ],
      );
      await client.query(
        `INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
         VALUES ($1, 1, 1, 30, '["SSO Pioneer"]'::jsonb) ON CONFLICT (user_id) DO NOTHING`,
        [ins.rows[0].id],
      );
      return ins.rows[0];
    });
    return { ...this.buildAuthResponse(user), provider: 'google' };
  }

  // ─── Administrator-created accounts (used by /admin/users and bulk import) ─

  async register(dto: RegisterDto): Promise<{ id: string; email: string; role: string }> {
    if (!REGISTERABLE_ROLES.includes(dto.role)) throw new BadRequestException('Invalid role.');
    if (!dto.password || dto.password.length < 8 || dto.password.length > 72) {
      throw new BadRequestException('Password must be between 8 and 72 characters.');
    }
    if (!dto.firstName?.trim()) throw new BadRequestException('First name is required.');
    const email = normalizeEmail(dto.email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new BadRequestException('A valid email is required.');

    const schools = await this.db.query(
      `SELECT id FROM schools WHERE id = $1 AND subscription_status IN ('ACTIVE', 'TRIAL')`,
      [dto.schoolId],
    );
    if (!schools.length) throw new BadRequestException('School not found or inactive.');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const rows = await this.db.queryWithTenant(
        dto.schoolId,
        `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE) RETURNING id, email, role`,
        [dto.schoolId, dto.campusId || null, dto.role, email, passwordHash, dto.firstName.trim(), (dto.lastName ?? '').trim()],
      );
      return rows[0];
    } catch (err: any) {
      if (err?.code === '23505') throw new ConflictException('A user with this email already exists in this school.');
      throw err;
    }
  }

  async resetDemoState() {
    if (!isDemoMode(this.config)) throw new NotFoundException();
    return { success: true, message: 'Demo sandbox is a read-mostly synthetic tenant; nothing to reset.', resettedAt: new Date().toISOString() };
  }
}

function cryptoRandom(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('crypto').randomBytes(32).toString('hex');
}
