import {
  Controller, Get, Post, Body, Param, UseGuards, Put, Query, Delete,
} from '@nestjs/common';
import {
  IsString, IsNotEmpty, IsUUID, IsEnum, IsOptional, IsNumber, IsInt,
  IsDateString, Min, IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
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

class CreateCourseworkDto {
  @IsUUID() sectionId: string;
  @IsUUID() subjectId: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;

  /** Accept either `courseworkType` or `type` from client — normalised by Transform. */
  @IsEnum(CourseworkType)
  @Transform(({ obj, value }) => {
    // Frontend may send assessmentType, type, or courseworkType — accept all
    return value ?? obj.type ?? obj.assessmentType ?? 'HOMEWORK';
  })
  courseworkType: CourseworkType;

  @IsOptional() @IsNumber() @Min(1) maxScore?: number;
  @IsOptional() @IsDateString() dueDate?: string;
  @IsEnum(AiGuidanceMode) @IsOptional() aiGuidanceMode?: AiGuidanceMode;
  @IsOptional() @IsString() aiSystemNotes?: string;
  @IsOptional() @IsString() rubric?: string;
  @IsOptional() @IsInt() @Min(1) timeLimitMinutes?: number;
  @IsOptional() @IsString() assessmentType?: string;
  @IsOptional() @IsString() type?: string;
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

  // ── Teacher: Create Coursework ──────────────────────────────────────────── //
  @Post('coursework')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  createCoursework(@CurrentUser() user: any, @Body() dto: CreateCourseworkDto) {
    return this.courseworkService.createCoursework(user.schoolId, user.id, dto);
  }

  // ── Teacher: View all coursework they created ───────────────────────────── //
  @Get('teacher/coursework')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getTeacherCoursework(@CurrentUser() user: any) {
    return this.courseworkService.getTeacherCoursework(user.schoolId, user.id);
  }

  // ── Teacher: View submissions for a coursework ─────────────────────────── //
  @Get('teacher/coursework/:id/submissions')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getSubmissions(@CurrentUser() user: any, @Param('id') courseworkId: string) {
    return this.courseworkService.getSubmissions(user.schoolId, courseworkId);
  }

  // ── Teacher: Grade a submission ────────────────────────────────────────── //
  @Put('teacher/submissions/:id/grade')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  gradeSubmission(
    @CurrentUser() user: any,
    @Param('id') submissionId: string,
    @Body() dto: GradeSubmissionDto,
  ) {
    return this.courseworkService.gradeSubmission(user.schoolId, submissionId, dto);
  }

  // ── Student: View assigned coursework (with optional filters) ──────────── //
  @Get('student/coursework')
  @Roles('STUDENT')
  getStudentCoursework(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.courseworkService.getStudentCoursework(user.schoolId, user.id, { status, subjectId });
  }

  // ── Student: Submit coursework ─────────────────────────────────────────── //
  @Post('student/submissions')
  @Roles('STUDENT')
  submitCoursework(@CurrentUser() user: any, @Body() dto: StudentSubmitDto) {
    return this.courseworkService.submitCoursework(user.schoolId, user.id, dto);
  }

  // ── Teacher: View AI sessions per coursework ───────────────────────────── //
  @Get('teacher/coursework/:id/ai-transcripts')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getAiTranscripts(@CurrentUser() user: any, @Param('id') courseworkId: string) {
    return this.courseworkService.getAiTranscripts(user.schoolId, courseworkId);
  }
}
