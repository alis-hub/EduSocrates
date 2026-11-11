import {
  Controller, Get, Post, Body, Param, UseGuards, Put, Query, Patch,
} from '@nestjs/common';
import {
  IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, IsNumber, IsInt,
  IsDateString, Min, IsArray, IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { CourseworkService } from './coursework.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';

export enum CourseworkType {
  HOMEWORK = 'HOMEWORK',
  QUIZ = 'QUIZ',
  ASSIGNMENT = 'ASSIGNMENT',
}

export enum AiGuidanceMode {
  SOCRATIC_STRICT = 'SOCRATIC_STRICT',
  SOCRATIC_HINTS_ONLY = 'SOCRATIC_HINTS_ONLY',
  TERMINOLOGY_ONLY = 'TERMINOLOGY_ONLY',
  DISABLED = 'DISABLED',
}

export enum CourseworkAccessLevel {
  PRIVATE = 'PRIVATE',
  PUBLIC_DIRECTORY = 'PUBLIC_DIRECTORY',
  UNLISTED = 'UNLISTED',
}

class CreateCourseworkDto {
  @IsUUID() sectionId: string;
  @IsUUID() subjectId: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;

  @IsEnum(CourseworkType)
  @Transform(({ obj, value }) => value ?? obj.type ?? obj.assessmentType ?? 'HOMEWORK')
  courseworkType: CourseworkType;

  @IsOptional() @IsNumber() @Min(1) maxScore?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsEnum(AiGuidanceMode) @IsOptional() aiGuidanceMode?: AiGuidanceMode;
  @IsOptional() @IsString() aiSystemNotes?: string;
  @IsOptional() @IsString() rubric?: string;
  @IsOptional() @IsInt() @Min(1) timeLimitMinutes?: number;
  @IsOptional() @IsBoolean() isPublic?: boolean;
  @IsOptional() @IsEnum(CourseworkAccessLevel) accessLevel?: CourseworkAccessLevel;
  @IsOptional() @IsString() socraticSystemPromptOverride?: string;
  @IsOptional() @IsString() assessmentType?: string;
  @IsOptional() @IsString() type?: string;
}

class UpdateVisibilityDto {
  @IsEnum(CourseworkAccessLevel) accessLevel: CourseworkAccessLevel;
}

class GradeSubmissionDto {
  @IsNumber() @Min(0) score: number;
  @IsOptional() @IsString() teacherFeedback?: string;
}

class StudentSubmitDto {
  @IsUUID() courseworkId: string;
  @IsOptional() @IsString() submissionText?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) attachmentUrls?: string[];
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourseworkController {
  constructor(private readonly courseworkService: CourseworkService) {}

  @Post('coursework')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  createCoursework(@CurrentUser() user: any, @Body() dto: CreateCourseworkDto) {
    return this.courseworkService.createCoursework(user.schoolId, user.id, dto);
  }

  @Get('teacher/coursework')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getTeacherCoursework(@CurrentUser() user: any) {
    return this.courseworkService.getTeacherCoursework(user.schoolId, user.id);
  }

  @Patch('teacher/coursework/:id/visibility')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  updateVisibility(
    @CurrentUser() user: any,
    @Param('id') courseworkId: string,
    @Body() dto: UpdateVisibilityDto,
  ) {
    return this.courseworkService.updateVisibility(user.schoolId, courseworkId, dto.accessLevel);
  }

  @Get('teacher/coursework/:id/submissions')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getSubmissions(@CurrentUser() user: any, @Param('id') courseworkId: string) {
    return this.courseworkService.getSubmissions(user.schoolId, courseworkId);
  }

  @Put('teacher/submissions/:id/grade')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  gradeSubmission(
    @CurrentUser() user: any,
    @Param('id') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.courseworkService.gradeSubmission(user.schoolId, submissionId, dto);
  }

  @Get('student/coursework')
  @Roles('STUDENT')
  getStudentCoursework(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.courseworkService.getStudentCoursework(user.schoolId, user.id, { status, subjectId });
  }

  @Post('student/submissions')
  @Roles('STUDENT')
  submitCoursework(@CurrentUser() user: any, @Body() dto: StudentSubmitDto) {
    return this.courseworkService.submitCoursework(user.schoolId, user.id, dto);
  }

  @Get('teacher/coursework/:id/ai-transcripts')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getAiTranscripts(@CurrentUser() user: any, @Param('id') courseworkId: string) {
    return this.courseworkService.getAiTranscripts(user.schoolId, courseworkId);
  }
}

/**
 * Public Coursework Resource Bank endpoints (TAD Clarification #6).
 * Never exposes institutional student submissions, grades, or private teacher notes.
 */
@Controller('public/coursework')
export class PublicCourseworkController {
  constructor(private readonly courseworkService: CourseworkService) {}

  @Get()
  listPublicCoursework(@Query('subject') subject?: string) {
    return this.courseworkService.getPublicCourseworkList(subject);
  }

  @Get(':id')
  getPublicCourseworkById(@Param('id') id: string) {
    return this.courseworkService.getPublicCourseworkById(id);
  }
}
