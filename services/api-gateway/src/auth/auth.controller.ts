import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail, IsString, MinLength, MaxLength, IsIn, IsOptional, IsNotEmpty, Length, IsUUID,
} from 'class-validator';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

const HOUR = 60 * 60 * 1000;

export class LoginDto {
  @IsEmail() @MaxLength(254) email: string;

  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) @MaxLength(72)
  password: string;

  @IsOptional() @IsString() @Length(6, 6) mfaCode?: string;

  /** Only needed when the same email belongs to several schools/academies. */
  @IsOptional() @IsUUID() schoolId?: string;
}

export class VerifyMfaDto {
  @IsString() @IsNotEmpty() @MaxLength(2000) tempToken: string;
  @IsString() @Length(6, 6, { message: 'MFA code must be exactly 6 digits.' }) code: string;
}

export class MfaSetupStartDto {
  @IsString() @IsNotEmpty() @MaxLength(2000) tempToken: string;
}

export class RequestRecoveryDto {
  @IsEmail() @MaxLength(254) email: string;
}

export class ResetPasswordDto {
  @IsString() @IsNotEmpty() @MaxLength(200) token: string;
  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) @MaxLength(72) password: string;
}

export class VerifyEmailDto {
  @IsString() @IsNotEmpty() @MaxLength(200) token: string;
}

export class PublicSignupDto {
  @IsEmail() @MaxLength(254) email: string;
  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) @MaxLength(72) password: string;
  @IsString() @IsNotEmpty() @MaxLength(100) firstName: string;
  @IsOptional() @IsString() @MaxLength(100) lastName?: string;
}

export class SsoLoginDto {
  @IsIn(['google']) provider: 'google';
  @IsString() @IsNotEmpty() @MaxLength(4096) idToken: string;
}

@Controller('auth')
@UseGuards(RateLimitGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @RateLimit({ name: 'login', limit: 30, windowMs: 15 * 60 * 1000 })
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.mfaCode, dto.schoolId);
  }

  /** Second step for administrators who already enrolled an authenticator app. */
  @Post('verify-mfa')
  @RateLimit({ name: 'verify-mfa', limit: 30, windowMs: 15 * 60 * 1000 })
  @HttpCode(200)
  verifyMfa(@Body() dto: VerifyMfaDto) {
    return this.authService.verifyMfa(dto.tempToken, dto.code);
  }

  /** First-time authenticator enrolment (administrators): returns secret + otpauth URL. */
  @Post('mfa/setup')
  @RateLimit({ name: 'mfa-setup', limit: 20, windowMs: HOUR })
  @HttpCode(200)
  mfaSetup(@Body() dto: MfaSetupStartDto) {
    return this.authService.mfaSetupStart(dto.tempToken);
  }

  @Post('mfa/enable')
  @RateLimit({ name: 'mfa-enable', limit: 30, windowMs: HOUR })
  @HttpCode(200)
  mfaEnable(@Body() dto: VerifyMfaDto) {
    return this.authService.mfaSetupConfirm(dto.tempToken, dto.code);
  }

  @Post('reset-password')
  @RateLimit({ name: 'reset', limit: 10, windowMs: HOUR })
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.password);
  }

  @Post('verify-email')
  @RateLimit({ name: 'verify', limit: 30, windowMs: HOUR })
  @HttpCode(200)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @RateLimit({ name: 'resend-verify', limit: 10, windowMs: HOUR })
  @HttpCode(200)
  resendVerification(@CurrentUser() user: any) {
    return this.authService.resendVerification(user.id);
  }

  @Post('request-recovery')
  @RateLimit({ name: 'recovery', limit: 10, windowMs: HOUR })
  @HttpCode(200)
  requestRecovery(@Body() dto: RequestRecoveryDto) {
    return this.authService.requestRecovery(dto.email);
  }

  /** Google sign-in. The ID token is verified server-side; the email in the request is never trusted. */
  @Post('sso')
  @RateLimit({ name: 'sso', limit: 30, windowMs: HOUR })
  @HttpCode(200)
  ssoLogin(@Body() dto: SsoLoginDto) {
    return this.authService.ssoLogin(dto);
  }

  /** Free self-directed learner sign-up. */
  @Post('public-signup')
  @RateLimit({ name: 'signup', limit: 10, windowMs: HOUR })
  @HttpCode(201)
  publicSignup(@Body() dto: PublicSignupDto) {
    return this.authService.publicSignup(dto);
  }

  /** Demo-only no-op. Returns 404 unless ENABLE_DEMO_MODE=true (never in production). */
  @Post('demo/reset')
  @HttpCode(200)
  resetDemoState() {
    return this.authService.resetDemoState();
  }

  @Post('sessions/revoke-others')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  revokeOtherSessions(@CurrentUser() user: any) {
    return this.authService.revokeOtherSessions(user.id);
  }
}
