import {
  Controller, Post, Body, Get, Query, Param, Req, Res, UseGuards,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { AiProxyService } from './ai-proxy.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import type { Response } from 'express';

class StartSessionDto {
  @IsUUID() courseworkId: string;
}

class ChatMessageDto {
  @IsString() @IsNotEmpty() sessionId: string;
  @IsString() @IsNotEmpty() message: string;
  /** subjectId returned by startSession — used for per-subject quota key. */
  @IsOptional() @IsUUID() subjectId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiProxyController {
  constructor(private readonly aiProxyService: AiProxyService) {}

  @Post('ai/session/start')
  @Roles('STUDENT')
  startSession(@CurrentUser() user: any, @Body() dto: StartSessionDto) {
    return this.aiProxyService.startSession(user, dto.courseworkId);
  }

  @Post('ai/chat/stream')
  @Roles('STUDENT')
  async chatStream(
    @CurrentUser() user: any,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ) {
    const subjectId = dto.subjectId ?? 'unknown';
    // Check per-subject quota before proxying (15 msg/hr per student per subject)
    await this.aiProxyService.checkAndDecrementQuota(user.schoolId, user.id, subjectId);
    return this.aiProxyService.proxyStream(
      dto.sessionId, dto.message, subjectId, user.schoolId, user.id, res,
    );
  }

  /**
   * Teacher/Admin: view AI guardrail audit log.
   * Supports ?courseworkId=UUID and ?flaggedOnly=true filters.
   */
  @Get('teacher/analytics/ai-audit')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getAuditLog(
    @CurrentUser() user: any,
    @Query('limit') limit = '100',
    @Query('courseworkId') courseworkId?: string,
    @Query('flaggedOnly') flaggedOnly?: string,
  ) {
    return this.aiProxyService.getAuditLog(
      user.schoolId,
      parseInt(limit, 10),
      {
        courseworkId,
        flaggedOnly: flaggedOnly === 'true',
      },
    );
  }

  /** Teacher: view full message transcript for a specific AI session. */
  @Get('teacher/ai-sessions/:sessionId/messages')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getSessionMessages(@Param('sessionId') sessionId: string) {
    return this.aiProxyService.getSessionMessages(sessionId);
  }
}
