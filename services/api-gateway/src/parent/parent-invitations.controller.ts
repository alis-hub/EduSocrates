import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ParentService } from './parent.service';

/**
 * Public Parent Invitation endpoints.
 * Unauthenticated endpoints used by parents opening a school-issued invitation link.
 */
@Controller('parent-invitations')
export class ParentInvitationsController {
  constructor(private readonly parentService: ParentService) {}

  /**
   * GET /parent-invitations/validate/:token
   * Validates single-use token, expiry, and returns school/student details without leaking raw credentials.
   */
  @Get('validate/:token')
  async validateToken(@Param('token') token: string) {
    return this.parentService.validateInvitationToken(token);
  }

  /**
   * POST /parent-invitations/accept
   * Activates parent-child association, sets password if new parent, and returns JWT session.
   */
  @Post('accept')
  async acceptInvitation(
    @Body()
    dto: {
      token: string;
      password?: string;
      firstName?: string;
      lastName?: string;
    },
  ) {
    return this.parentService.acceptInvitation(dto);
  }
}
