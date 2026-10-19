import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators';

class CreateSchoolDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsOptional() @IsString() domain?: string;
}

class UpdateSchoolStatusDto {
  @IsEnum(['ACTIVE', 'SUSPENDED']) status: 'ACTIVE' | 'SUSPENDED';
}

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  /** Platform-wide aggregate statistics. */
  @Get('stats')
  getStats() {
    return this.superAdminService.getPlatformStats();
  }

  /** List all registered schools. */
  @Get('schools')
  getSchools() {
    return this.superAdminService.getSchools();
  }

  /** Onboard a new school tenant. */
  @Post('schools')
  createSchool(@Body() dto: CreateSchoolDto) {
    return this.superAdminService.createSchool(dto);
  }

  /** Activate or suspend a school. */
  @Patch('schools/:id/status')
  updateSchoolStatus(@Param('id') id: string, @Body() dto: UpdateSchoolStatusDto) {
    return this.superAdminService.updateSchoolStatus(id, dto.status);
  }

  /** Global AI audit log across all schools. */
  @Get('ai-audit')
  getGlobalAiAudit(@Query('limit') limit = '100') {
    return this.superAdminService.getGlobalAiAudit(parseInt(limit, 10));
  }
}

