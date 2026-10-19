import {
  Injectable, UnauthorizedException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../database/database.service';

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

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string; user: any }> {
    // Find user — we do NOT apply RLS here (cross-tenant lookup by email)
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
      },
    };
  }

  async register(dto: RegisterDto): Promise<{ id: string; email: string; role: string }> {
    // Validate school exists
    const schools = await this.db.query(
      `SELECT id FROM schools WHERE id = $1 AND subscription_status = 'ACTIVE'`,
      [dto.schoolId],
    );
    if (!schools.length) {
      throw new BadRequestException('School not found or inactive. Contact your administrator.');
    }

    // Check duplicate email within the school
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
}
