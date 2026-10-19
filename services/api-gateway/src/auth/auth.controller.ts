import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  IsEmail, IsString, MinLength, IsEnum, IsUUID, IsOptional,
} from 'class-validator';

const ALLOWED_REGISTER_ROLES = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] as const;

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
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
   * Open registration endpoint — validates that schoolId exists in the DB.
   * Super Admin accounts cannot be created here (enforced by role enum).
   */
  @Post('register')
  @HttpCode(201)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
