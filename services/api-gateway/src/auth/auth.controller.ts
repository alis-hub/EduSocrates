import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail, IsString, MinLength, IsEnum, IsUUID, IsOptional, IsNotEmpty, Length,
} from 'class-validator';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';

const ALLOWED_REGISTER_ROLES = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'INDEPENDENT_STUDENT'] as const;

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;

  @IsOptional()
  @IsString()
  mfaCode?: string;
}

export class VerifyMfaDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @Length(6, 6, { message: 'MFA code must be exactly 6 digits.' })
  code: string;
}

export class RequestRecoveryDto {
  @IsEmail()
  email: string;
}

export class PublicSignupDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) password: string;
  @IsString() @IsNotEmpty() firstName: string;
  @IsOptional() @IsString() lastName?: string;
}

export class RedeemInviteDto {
  @IsString() @IsNotEmpty() inviteCode: string;
}

export class SsoLoginDto {
  @IsEnum(['google', 'linkedin', 'microsoft'])
  provider: 'google' | 'linkedin' | 'microsoft';

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsEnum(ALLOWED_REGISTER_ROLES) role: string;
  @IsUUID() schoolId: string;
  @IsOptional() @IsUUID() campusId?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.mfaCode);
  }

  /**
   * Verify Multi-Factor Authentication (MFA / TOTP) code for privileged administrative roles.
   */
  @Post('verify-mfa')
  @HttpCode(200)
  verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.authService.verifyMfa(dto.tempToken, dto.code);
  }

  /**
   * Secure account password recovery request (anti-enumeration).
   */
  @Post('request-recovery')
  @HttpCode(200)
  requestRecovery(@Body() dto: RequestRecoveryDto) {
    return this.authService.requestRecovery(dto.email);
  }

  /**
   * Single Sign-On login / registration (Google, LinkedIn & Microsoft).
   */
  @Post('sso')
  @HttpCode(200)
  ssoLogin(@Body() dto: SsoLoginDto) {
    return this.authService.ssoLogin(dto);
  }

  /**
   * Public self-directed learner signup (TAD v2.3.0).
   */
  @Post('public-signup')
  @HttpCode(201)
  publicSignup(@Body() dto: PublicSignupDto) {
    return this.authService.publicSignup(dto);
  }

  /**
   * Independent-to-Enrolled learner migration via institutional invite code.
   */
  @Post('redeem-invite')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  redeemInvite(@CurrentUser() user: any, @Body() dto: RedeemInviteDto) {
    return this.authService.redeemInvite(user.id, dto.inviteCode);
  }

  @Post('register')
  @HttpCode(201)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Safe Reset of Synthetic Demo Sandbox State (preserves production tenants).
   */
  @Post('demo/reset')
  @HttpCode(200)
  resetDemoState() {
    return this.authService.resetDemoState();
  }

  /**
   * Device and Session Management: Revoke all other active sessions.
   */
  @Post('sessions/revoke-others')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  revokeOtherSessions(@CurrentUser() user: any) {
    return this.authService.revokeOtherSessions(user.id);
  }
}
