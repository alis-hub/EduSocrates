import { randomUUID } from 'crypto';
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
import { EmailService } from '../email/email.service';
import * as nodeCrypto from 'crypto';

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
    private readonly email: EmailService,
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
    const accessToken = this.jwtService.sign(payload, { jwtid: randomUUID() });
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

  // ─── Email tokens: password reset and address verification ────────────────

  /** Creates a single-use token (only its hash is stored) and cancels any older unused one of the same kind. */
  private async issueEmailToken(userId: string, purpose: 'VERIFY' | 'RESET', ttlMs: number): Promise<string> {
    const raw = nodeCrypto.randomBytes(32).toString('hex');
    const hash = nodeCrypto.createHash('sha256').update(raw).digest('hex');
    await this.db.query(`UPDATE email_tokens SET used_at = NOW() WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`, [userId, purpose]);
    await this.db.query(
      `INSERT INTO email_tokens (user_id, purpose, token_hash, expires_at) VALUES ($1,$2,$3, NOW() + ($4 || ' milliseconds')::interval)`,
      [userId, purpose, hash, String(ttlMs)],
    );
    return raw;
  }

  /** Marks the token used and returns its owner, or null if it is unknown, used or expired. */
  private async consumeEmailToken(raw: string, purpose: 'VERIFY' | 'RESET'): Promise<string | null> {
    if (!raw || raw.length > 200) return null;
    const hash = nodeCrypto.createHash('sha256').update(raw).digest('hex');
    const rows = await this.db.query(
      `UPDATE email_tokens SET used_at = NOW()
       WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW()
       RETURNING user_id`,
      [hash, purpose],
    );
    return rows[0]?.user_id ?? null;
  }

  /** Best-effort: a failure to send must never fail sign-up. */
  async sendVerificationEmail(user: { id: string; email: string; first_name?: string; email_verified_at?: any }): Promise<void> {
    try {
      if (user.email_verified_at) return;
      const raw = await this.issueEmailToken(user.id, 'VERIFY', 24 * 60 * 60 * 1000);
      await this.email.send(this.email.verifyEmailMail(user.email, user.first_name || 'there', `${this.email.baseUrl()}/verify-email?token=${raw}`));
    } catch (err: any) {
      this.logger.error(`Verification email failed: ${err?.message}`);
    }
  }

  async verifyEmail(token: string) {
    const userId = await this.consumeEmailToken(token, 'VERIFY');
    if (!userId) throw new BadRequestException('This confirmation link is invalid or has expired. Sign in and request a new one.');
    await this.db.query(`UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $1`, [userId]);
    return { success: true, message: 'Your email address is confirmed.' };
  }

  async resendVerification(userId: string) {
    const rows = await this.db.query(`SELECT id, email, first_name, email_verified_at FROM users WHERE id = $1 AND is_active = TRUE`, [userId]);
    if (!rows.length) throw new NotFoundException('Account not found.');
    if (rows[0].email_verified_at) return { success: true, message: 'Your email is already confirmed.' };
    await this.redis.checkAndIncrementQuota(`verify-mail:${userId}`, 60 * 60 * 1000, 3, 'Please wait before requesting another email.');
    await this.sendVerificationEmail(rows[0]);
    return { success: true, message: 'We sent a new confirmation email.' };
  }

  /** Always returns the same response (no account enumeration); the work runs in the background so timing is the same too. */
  async requestRecovery(email: string) {
    const normalized = normalizeEmail(email);
    this.sendRecoveryEmail(normalized).catch((err) => this.logger.error(`Recovery email failed: ${err?.message}`));
    return {
      success: true,
      message: 'If an active account exists for this address, password reset instructions have been sent.',
    };
  }

  private async sendRecoveryEmail(email: string): Promise<void> {
    // At most 3 reset emails per address per hour, however many requests arrive.
    try { await this.redis.checkAndIncrementQuota(`recovery-mail:${email}`, 60 * 60 * 1000, 3); } catch { return; }
    const users = await this.db.query(
      `SELECT u.id, u.first_name, u.password_hash, s.name AS school_name
       FROM users u JOIN schools s ON s.id = u.school_id
       WHERE LOWER(u.email) = $1 AND u.is_active = TRUE AND u.role <> 'SUPER_ADMIN'
       ORDER BY u.created_at LIMIT 5`,
      [email],
    );
    const eligible = users.filter((u: any) => !isLockedSeedAccount(u.password_hash, this.config));
    if (!eligible.length) return;
    const accounts: { schoolName: string; url: string }[] = [];
    for (const u of eligible) {
      const raw = await this.issueEmailToken(u.id, 'RESET', 60 * 60 * 1000);
      accounts.push({ schoolName: u.school_name, url: `${this.email.baseUrl()}/reset-password?token=${raw}` });
    }
    await this.email.send(this.email.resetPasswordMail(email, eligible[0].first_name || 'there', accounts));
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.consumeEmailToken(token, 'RESET');
    if (!userId) throw new BadRequestException('This reset link is invalid or has expired. Request a new one.');
    const rows = await this.db.query(`SELECT id, password_hash, is_active, role FROM users WHERE id = $1`, [userId]);
    const u = rows[0];
    if (!u || !u.is_active || u.role === 'SUPER_ADMIN' || isLockedSeedAccount(u.password_hash, this.config)) {
      throw new BadRequestException('This account cannot be reset by email. Contact support.');
    }
    const hash = await bcrypt.hash(newPassword, 10);
    // Having the emailed link also proves the address is theirs.
    await this.db.query(`UPDATE users SET password_hash = $1, email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $2`, [hash, userId]);
    // Signs out every device that was using the old password.
    await this.redis.set(`rv:${userId}`, Date.now(), 60 * 60 * 24 * 30);
    return { success: true, message: 'Your password has been changed. Please sign in.' };
  }

  /** Signs out this one token (logout): it is refused from now until it would have expired anyway. */
  async revokeToken(token?: string | null) {
    if (!token) return;
    try {
      const p: any = this.jwtService.verify(token, { algorithms: ['HS256'] });
      if (p?.typ !== 'access' || !p.jti) return;
      const ttl = Math.max(1, (p.exp ?? 0) - Math.floor(Date.now() / 1000));
      await this.redis.set(`rt:${p.jti}`, 1, ttl);
    } catch {
      /* already invalid: nothing to revoke */
    }
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
    void this.sendVerificationEmail(user);
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
    if (usable) {
      // Google has already verified this address.
      await this.db.query(`UPDATE users SET email_verified_at = COALESCE(email_verified_at, NOW()) WHERE id = $1`, [usable.id]);
      return { ...this.buildAuthResponse(usable), provider: 'google' };
    }

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
    await this.db.query(`UPDATE users SET email_verified_at = NOW() WHERE id = $1`, [user.id]);
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
