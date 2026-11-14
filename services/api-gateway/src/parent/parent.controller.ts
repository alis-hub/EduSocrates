import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import { ParentService } from './parent.service';

/**
 * Authenticated Parent Portal endpoints.
 * Enforces PARENT role and verifies active parent-child relationship for every student-specific route.
 */
@Controller('parent')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  /** GET /parent/children — list student accounts linked to this parent with summary KPIs. */
  @Get('children')
  @Roles('PARENT')
  async getMyChildren(@CurrentUser() user: any) {
    return this.parentService.getMyChildren(user);
  }

  /** GET /parent/children/:studentId/overview — child academic summary & alerts. */
  @Get('children/:studentId/overview')
  @Roles('PARENT')
  async getChildOverview(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildOverview(user, studentId);
  }

  /** GET /parent/children/:studentId/coursework — read-only view of a child's coursework + grades. */
  @Get('children/:studentId/coursework')
  @Roles('PARENT')
  async getChildCoursework(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildCoursework(user, studentId);
  }

  /** GET /parent/children/:studentId/performance — subject-wise grades, trends, strengths/weaknesses. */
  @Get('children/:studentId/performance')
  @Roles('PARENT')
  async getChildPerformance(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildPerformance(user, studentId);
  }

  /** GET /parent/children/:studentId/mastery — concept mastery status, recommendations & disclaimer. */
  @Get('children/:studentId/mastery')
  @Roles('PARENT')
  async getChildMastery(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildMastery(user, studentId);
  }

  /** GET /parent/children/:studentId/activity — study minutes, weekly consistency, AI Tutor summary. */
  @Get('children/:studentId/activity')
  @Roles('PARENT')
  async getChildActivity(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildActivity(user, studentId);
  }

  /** GET /parent/children/:studentId/attendance — present/absent counts and school notices. */
  @Get('children/:studentId/attendance')
  @Roles('PARENT')
  async getChildAttendance(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildAttendance(user, studentId);
  }

  /** GET /parent/children/:studentId/feedback — teacher comments and observations. */
  @Get('children/:studentId/feedback')
  @Roles('PARENT')
  async getChildFeedback(
    @CurrentUser() user: any,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.getChildFeedback(user, studentId);
  }

  /** GET /parent/notifications — parent alerts. */
  @Get('notifications')
  @Roles('PARENT')
  async getNotifications(@CurrentUser() user: any) {
    return this.parentService.getNotifications(user);
  }

  /** GET /parent/profile — parent profile info. */
  @Get('profile')
  @Roles('PARENT')
  async getProfile(@CurrentUser() user: any) {
    return this.parentService.getProfile(user);
  }
}
