import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength,
} from 'class-validator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles } from '../auth/decorators';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';
import { OnboardingService } from './onboarding.service';
import { TeacherClassesService } from './teacher-classes.service';

const HOUR = 60 * 60 * 1000;
const NAME = { message: 'Please enter a name (up to 64 characters).' };

class Credentials {
  @IsEmail() @MaxLength(254) email: string;
  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) @MaxLength(72) password: string;
}

export class SchoolOnboardingDto {
  @IsString() @IsNotEmpty() @MaxLength(120) schoolName: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
  @IsString() @IsNotEmpty() @MaxLength(64) adminFirstName: string;
  @IsString() @IsNotEmpty() @MaxLength(64) adminLastName: string;
  @IsEmail() @MaxLength(254) adminEmail: string;
  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters long.' }) @MaxLength(72) adminPassword: string;
}

export class TutorOnboardingDto extends Credentials {
  @IsString() @IsNotEmpty() @MaxLength(64) firstName: string;
  @IsString() @IsNotEmpty() @MaxLength(64) lastName: string;
  /** School / academy / tuition centre name. */
  @IsString() @IsNotEmpty() @MaxLength(120) academyName: string;
  @IsString() @IsNotEmpty() @MaxLength(64) className: string;
  @IsInt({ message: 'Grade must be a number from 6 to 13.' }) @Min(6, { message: 'GuruMera is for Grade 6 and above.' }) @Max(13) gradeLevel: number;
  @IsString() @IsNotEmpty() @MaxLength(100) subjectName: string;
  @IsOptional() @IsString() @MaxLength(64) sectionName?: string;
  @IsOptional() @IsString() @MaxLength(80) campusName?: string;
  @IsOptional() @IsString() @MaxLength(80) city?: string;
}

export class JoinClassNewDto extends Credentials {
  @IsString() @IsNotEmpty() @MaxLength(32) code: string;
  @IsString() @IsNotEmpty() @MaxLength(64) firstName: string;
  @IsString() @IsNotEmpty() @MaxLength(64) lastName: string;
}

export class JoinClassDto {
  @IsString() @IsNotEmpty() @MaxLength(32) code: string;
}

export class CreateClassDto {
  @IsString() @IsNotEmpty() @MaxLength(64) className: string;
  @IsInt() @Min(6, { message: 'GuruMera is for Grade 6 and above.' }) @Max(13) gradeLevel: number;
  @IsString() @IsNotEmpty() @MaxLength(100) subjectName: string;
  @IsOptional() @IsString() @MaxLength(64) sectionName?: string;
}

/** Public: no account needed. Every route is rate-limited per IP. */
@Controller()
@UseGuards(RateLimitGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('onboarding/school')
  @RateLimit({ name: 'onboard-school', limit: 5, windowMs: HOUR })
  @HttpCode(201)
  school(@Body() dto: SchoolOnboardingDto) {
    return this.onboarding.createSchool(dto);
  }

  @Post('onboarding/tutor')
  @RateLimit({ name: 'onboard-tutor', limit: 5, windowMs: HOUR })
  @HttpCode(201)
  tutor(@Body() dto: TutorOnboardingDto) {
    return this.onboarding.createTutor(dto);
  }

  @Post('join/class')
  @RateLimit({ name: 'join-class', limit: 20, windowMs: HOUR })
  @HttpCode(201)
  joinNew(@Body() dto: JoinClassNewDto) {
    return this.onboarding.joinClassNewStudent(dto);
  }
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
export class StudentJoinController {
  constructor(private readonly onboarding: OnboardingService) {}

  @Post('student/join-class')
  @Roles('STUDENT')
  @RateLimit({ name: 'join-class-auth', limit: 30, windowMs: HOUR })
  @HttpCode(200)
  join(@CurrentUser() user: any, @Body() dto: JoinClassDto) {
    return this.onboarding.joinClassExistingStudent({ id: user.id, schoolId: user.schoolId }, dto.code);
  }
}

@Controller('teacher/classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('TEACHER')
export class TeacherClassesController {
  constructor(private readonly classes: TeacherClassesService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return this.classes.list(user);
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateClassDto) {
    return this.classes.create(user, dto);
  }

  @Post(':sectionId/join-code')
  @HttpCode(200)
  rotate(@CurrentUser() user: any, @Param('sectionId', new ParseUUIDPipe()) sectionId: string) {
    return this.classes.rotateCode(user, sectionId);
  }

  @Delete(':sectionId/join-code')
  revoke(@CurrentUser() user: any, @Param('sectionId', new ParseUUIDPipe()) sectionId: string) {
    return this.classes.revokeCode(user, sectionId);
  }

  @Get(':sectionId/students')
  students(@CurrentUser() user: any, @Param('sectionId', new ParseUUIDPipe()) sectionId: string) {
    return this.classes.students(user, sectionId);
  }

  @Delete(':sectionId/students/:studentId')
  remove(
    @CurrentUser() user: any,
    @Param('sectionId', new ParseUUIDPipe()) sectionId: string,
    @Param('studentId', new ParseUUIDPipe()) studentId: string,
  ) {
    return this.classes.removeStudent(user, sectionId, studentId);
  }
}
