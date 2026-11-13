"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const database_service_1 = require("../database/database.service");
let AuthService = class AuthService {
    db;
    jwtService;
    config;
    constructor(db, jwtService, config) {
        this.db = db;
        this.jwtService = jwtService;
        this.config = config;
    }
    buildAuthResponse(user) {
        const payload = {
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
    async login(email, password) {
        const users = await this.db.query(`SELECT u.*, s.id as school_id FROM users u
       JOIN schools s ON s.id = u.school_id
       WHERE u.email = $1 AND u.is_active = true
       LIMIT 1`, [email]);
        if (!users.length)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const user = users[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.buildAuthResponse(user);
    }
    async publicSignup(dto) {
        const existing = await this.db.query(`SELECT id FROM users WHERE email = $1 LIMIT 1`, [dto.email]);
        if (existing.length) {
            throw new common_1.ConflictException('An account with this email already exists. Please sign in.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.db.withTransaction(async (client) => {
            await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [database_service_1.PUBLIC_HUB_TENANT_ID]);
            const inserted = await client.query(`INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, NULL, 'INDEPENDENT_STUDENT', $2, $3, $4, $5, TRUE)
         RETURNING *`, [database_service_1.PUBLIC_HUB_TENANT_ID, dto.email, passwordHash, dto.firstName, dto.lastName?.trim() || 'Learner']);
            const created = inserted.rows[0];
            await client.query(`INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
         VALUES ($1, 1, 1, 25, '["First Spark"]'::jsonb)
         ON CONFLICT (user_id) DO NOTHING`, [created.id]);
            return created;
        });
        return this.buildAuthResponse(user);
    }
    async redeemInvite(userId, inviteCode) {
        const code = inviteCode.trim().toUpperCase();
        const result = await this.db.withTransaction(async (client) => {
            const inviteRes = await client.query(`SELECT si.*, s.name as school_name, s.subscription_status
         FROM school_invites si
         JOIN schools s ON s.id = si.school_id
         WHERE UPPER(si.invite_code) = $1`, [code]);
            if (!inviteRes.rows.length) {
                throw new common_1.NotFoundException('Invalid institutional enrollment code.');
            }
            const invite = inviteRes.rows[0];
            if (new Date(invite.expires_at) < new Date()) {
                throw new common_1.BadRequestException('This invite code has expired.');
            }
            if (invite.uses_count >= invite.max_uses) {
                throw new common_1.BadRequestException('This invite code has reached its usage limit.');
            }
            if (invite.subscription_status === 'SUSPENDED') {
                throw new common_1.BadRequestException('Target school subscription is currently suspended.');
            }
            await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [invite.school_id]);
            const updatedUserRes = await client.query(`UPDATE users
         SET school_id = $1,
             campus_id = $2,
             role = $3
         WHERE id = $4
         RETURNING *`, [invite.school_id, invite.campus_id, invite.target_role || 'STUDENT', userId]);
            if (!updatedUserRes.rows.length) {
                throw new common_1.NotFoundException('User account not found.');
            }
            const updatedUser = updatedUserRes.rows[0];
            if (invite.section_id && (invite.target_role || 'STUDENT') === 'STUDENT') {
                const ayRes = await client.query(`SELECT id FROM academic_years WHERE school_id = $1 AND is_active = TRUE ORDER BY start_date DESC LIMIT 1`, [invite.school_id]);
                if (ayRes.rows.length) {
                    await client.query(`INSERT INTO enrollments (school_id, student_id, section_id, academic_year_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (student_id, section_id, academic_year_id) DO NOTHING`, [invite.school_id, userId, invite.section_id, ayRes.rows[0].id]);
                }
            }
            await client.query(`UPDATE school_invites SET uses_count = uses_count + 1 WHERE id = $1`, [invite.id]);
            return { updatedUser, schoolName: invite.school_name };
        });
        return {
            ...this.buildAuthResponse(result.updatedUser),
            schoolName: result.schoolName,
            migrated: true,
        };
    }
    async register(dto) {
        const schools = await this.db.query(`SELECT id FROM schools WHERE id = $1 AND subscription_status IN ('ACTIVE', 'TRIAL')`, [dto.schoolId]);
        if (!schools.length) {
            throw new common_1.BadRequestException('School not found or inactive. Contact your administrator.');
        }
        const existing = await this.db.query(`SELECT id FROM users WHERE school_id = $1 AND email = $2`, [dto.schoolId, dto.email]);
        if (existing.length) {
            throw new common_1.ConflictException('A user with this email already exists in this school.');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const rows = await this.db.queryWithTenant(dto.schoolId, `INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
       RETURNING id, email, role`, [
            dto.schoolId,
            dto.campusId || null,
            dto.role,
            dto.email,
            passwordHash,
            dto.firstName,
            dto.lastName,
        ]);
        return rows[0];
    }
    async ssoLogin(dto) {
        const email = dto.email.trim().toLowerCase();
        const existing = await this.db.query(`SELECT u.*, s.id as school_id FROM users u
       JOIN schools s ON s.id = u.school_id
       WHERE LOWER(u.email) = $1 AND u.is_active = true
       LIMIT 1`, [email]);
        if (existing.length) {
            return this.buildAuthResponse(existing[0]);
        }
        const domain = email.includes('@') ? email.split('@')[1] : '';
        let targetSchoolId = database_service_1.PUBLIC_HUB_TENANT_ID;
        let targetCampusId = null;
        let role = 'INDEPENDENT_STUDENT';
        if (domain &&
            domain !== 'gmail.com' &&
            domain !== 'googlemail.com' &&
            domain !== 'yahoo.com' &&
            domain !== 'outlook.com' &&
            domain !== 'hotmail.com') {
            const matchedSchool = await this.db.query(`SELECT s.id, c.id as default_campus_id FROM schools s
         LEFT JOIN campuses c ON c.school_id = s.id
         WHERE LOWER(s.domain) = $1 AND s.subscription_status IN ('ACTIVE', 'TRIAL')
         LIMIT 1`, [domain.toLowerCase()]);
            if (matchedSchool.length) {
                targetSchoolId = matchedSchool[0].id;
                targetCampusId = matchedSchool[0].default_campus_id || null;
                if (dto.provider === 'linkedin' ||
                    email.includes('teacher') ||
                    email.includes('faculty') ||
                    email.includes('prof')) {
                    role = 'TEACHER';
                }
                else {
                    role = 'STUDENT';
                }
            }
        }
        const firstName = dto.firstName?.trim() || email.split('@')[0] || 'User';
        const lastName = dto.lastName?.trim() || (role === 'INDEPENDENT_STUDENT' ? 'Learner' : '');
        const randomPass = await bcrypt.hash(`sso_${Math.random()}_${Date.now()}`, 10);
        const user = await this.db.withTransaction(async (client) => {
            await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [targetSchoolId]);
            const ins = await client.query(`INSERT INTO users (school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
         RETURNING *`, [targetSchoolId, targetCampusId, role, email, randomPass, firstName, lastName]);
            const created = ins.rows[0];
            if (role === 'STUDENT' || role === 'INDEPENDENT_STUDENT') {
                await client.query(`INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
           VALUES ($1, 1, 1, 30, '["SSO Pioneer"]'::jsonb)
           ON CONFLICT (user_id) DO NOTHING`, [created.id]);
            }
            return created;
        });
        return {
            ...this.buildAuthResponse(user),
            tenantRouted: targetSchoolId !== database_service_1.PUBLIC_HUB_TENANT_ID,
            provider: dto.provider,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map