import { Controller, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail, IsString, MinLength, IsEnum, IsUUID, IsOptional, IsNotEmpty,
} from 'class-validator';
import { JwtAuthGuard } from './guards';
import { CurrentUser } from './decorators';

const ALLOWED_REGISTER_ROLES = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'INDEPENDENT_STUDENT'] as const;

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

class PublicSignupDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() firstName: string;
  @IsOptional() @IsString() lastName?: string;
}

class RedeemInviteDto {
  @IsString() @IsNotEmpty() inviteCode: string;
}

class RegisterDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
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
    return this.authService.login(dto.email, dto.password);
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
}
