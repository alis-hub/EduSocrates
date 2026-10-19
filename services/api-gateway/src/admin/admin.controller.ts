import {
  Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query,
} from '@nestjs/common';
import {
  IsString, IsOptional, IsUUID, IsInt, IsNotEmpty, Min,
  IsEmail, MinLength, IsEnum, IsDateString, IsArray,
} from 'class-validator';
import { AdminService } from './admin.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';

// ── DTOs ──────────────────────────────────────────────────────────────────── //

class CreateCampusDto {
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsString() address?: string;
}

class CreateClassDto {
  @IsUUID() campusId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
}

class CreateSectionDto {
  @IsUUID() classId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsOptional() @IsInt() @Min(1) capacity?: number;
}

class CreateSubjectDto {
  @IsUUID() classId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() code: string;
}

class CreateAcademicYearDto {
  @IsString() @IsNotEmpty() name: string;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
}

class CreateEnrollmentDto {
  @IsUUID() studentId: string;
  @IsUUID() sectionId: string;
  @IsUUID() academicYearId: string;
}

class CreateAllocationDto {
  @IsUUID() teacherId: string;
  @IsUUID() subjectId: string;
  @IsUUID() sectionId: string;
}

const ALLOWED_USER_ROLES = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT', 'PARENT'] as const;
class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsString() @IsNotEmpty() firstName: string;
  @IsString() @IsNotEmpty() lastName: string;
  @IsEnum(ALLOWED_USER_ROLES) role: string;
  @IsOptional() @IsUUID() campusId?: string;
}

class BulkCreateUsersDto {
  @IsArray()
  users: any[];
}

class CreateParentAssociationDto {
  @IsUUID()
  parentId: string;

  @IsUUID()
  studentId: string;

  @IsOptional()
  @IsString()
  relationshipType?: string;
}

// ── Controller ───────────────────────────────────────────────────────────── //

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
  ) {}

  // ── Campuses ─────────────────────────────────────────────────────────────── //
  @Get('campuses')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  getCampuses(@CurrentUser() user: any) {
    return this.adminService.getCampuses(user.schoolId);
  }

  @Post('campuses')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createCampus(@CurrentUser() user: any, @Body() dto: CreateCampusDto) {
    return this.adminService.createCampus(user.schoolId, dto);
  }

  // ── Classes ──────────────────────────────────────────────────────────────── //
  @Get('classes')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  getClasses(@CurrentUser() user: any) {
    return this.adminService.getClasses(user.schoolId);
  }

  @Post('classes')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createClass(@CurrentUser() user: any, @Body() dto: CreateClassDto) {
    return this.adminService.createClass(user.schoolId, dto);
  }

  // ── Sections ─────────────────────────────────────────────────────────────── //
  @Get('sections')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  getSections(@CurrentUser() user: any) {
    return this.adminService.getSections(user.schoolId);
  }

  @Post('sections')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createSection(@CurrentUser() user: any, @Body() dto: CreateSectionDto) {
    return this.adminService.createSection(user.schoolId, dto);
  }

  // ── Subjects ─────────────────────────────────────────────────────────────── //
  @Get('subjects')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  getSubjects(@CurrentUser() user: any) {
    return this.adminService.getSubjects(user.schoolId);
  }

  @Post('subjects')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createSubject(@CurrentUser() user: any, @Body() dto: CreateSubjectDto) {
    return this.adminService.createSubject(user.schoolId, dto);
  }

  // ── Academic Years ───────────────────────────────────────────────────────── //
  @Get('academic-years')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN', 'TEACHER')
  getAcademicYears(@CurrentUser() user: any) {
    return this.adminService.getAcademicYears(user.schoolId);
  }

  @Post('academic-years')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createAcademicYear(@CurrentUser() user: any, @Body() dto: CreateAcademicYearDto) {
    return this.adminService.createAcademicYear(user.schoolId, dto);
  }

  // ── Enrollments ──────────────────────────────────────────────────────────── //
  @Get('enrollments')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  getEnrollments(@CurrentUser() user: any) {
    return this.adminService.getEnrollments(user.schoolId);
  }

  @Post('enrollments')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createEnrollment(@CurrentUser() user: any, @Body() dto: CreateEnrollmentDto) {
    return this.adminService.createEnrollment(user.schoolId, dto);
  }

  @Delete('enrollments/:id')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  deleteEnrollment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteEnrollment(user.schoolId, id);
  }

  // ── Teacher-Subject Allocations ──────────────────────────────────────────── //
  @Get('allocations')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  getAllocations(@CurrentUser() user: any) {
    return this.adminService.getAllocations(user.schoolId);
  }

  @Post('allocations')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createAllocation(@CurrentUser() user: any, @Body() dto: CreateAllocationDto) {
    return this.adminService.createAllocation(user.schoolId, dto);
  }

  @Delete('allocations/:id')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  deleteAllocation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteAllocation(user.schoolId, id);
  }

  // ── User Management ──────────────────────────────────────────────────────── //
  @Get('users')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  getUsers(@CurrentUser() user: any, @Query('role') role?: string) {
    return this.adminService.getUsers(user.schoolId, role);
  }

  @Post('users')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createUser(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    return this.authService.register({
      ...dto,
      schoolId: user.schoolId,
    });
  }

  @Patch('users/:id/deactivate')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  deactivateUser(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deactivateUser(user.schoolId, id);
  }

  /**
   * Bulk user provisioning — accepts a JSON array of user rows (CSV parsed client-side).
   * Returns { created: N, failed: [{ row, error }] }
   */
  @Post('users/bulk')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  async bulkCreateUsers(@CurrentUser() user: any, @Body() dto: BulkCreateUsersDto) {
    return this.adminService.bulkCreateUsers(user.schoolId, dto.users, this.authService);
  }

  // ── Parent-Student Associations ──────────────────────────────────────────── //
  @Get('parent-associations')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  getParentAssociations(@CurrentUser() user: any) {
    return this.adminService.getParentAssociations(user.schoolId);
  }

  @Post('parent-associations')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  createParentAssociation(
    @CurrentUser() user: any,
    @Body() dto: CreateParentAssociationDto,
  ) {
    return this.adminService.createParentAssociation(user.schoolId, dto);
  }

  @Delete('parent-associations/:id')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  deleteParentAssociation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.adminService.deleteParentAssociation(user.schoolId, id);
  }

  // ── Dashboard Stats ──────────────────────────────────────────────────────── //
  @Get('stats')
  @Roles('SCHOOL_ADMIN', 'SUPER_ADMIN')
  getStats(@CurrentUser() user: any) {
    return this.adminService.getDashboardStats(user.schoolId);
  }
}

