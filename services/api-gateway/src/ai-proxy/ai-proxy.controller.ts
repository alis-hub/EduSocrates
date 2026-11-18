import {
  Controller, Post, Body, Get, Query, Param, Res, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsUUID, IsOptional, MaxLength } from 'class-validator';
import { AiProxyService } from './ai-proxy.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles, CurrentUser } from '../auth/decorators';
import type { Response } from 'express';

class StartSessionDto {
  @IsUUID() courseworkId: string;
}

class ChatMessageDto {
  @IsUUID() sessionId: string;
  @IsString() @IsNotEmpty() @MaxLength(2000) message: string;
  @IsOptional() @IsUUID() subjectId?: string;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AiProxyController {
  constructor(private readonly aiProxyService: AiProxyService) {}

  @Post('ai/session/start')
  @Roles('STUDENT', 'INDEPENDENT_STUDENT')
  startSession(@CurrentUser() user: any, @Body() dto: StartSessionDto) {
    return this.aiProxyService.startSession(user, dto.courseworkId);
  }

  @Post('ai/chat/stream')
  @Roles('STUDENT', 'INDEPENDENT_STUDENT')
  async chatStream(
    @CurrentUser() user: any,
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
  ) {
    const subjectId = dto.subjectId ?? 'unknown';
    await this.aiProxyService.assertSessionOwner(user.schoolId, user.id, dto.sessionId);
    await this.aiProxyService.checkAndDecrementQuota(user.schoolId, user.id, subjectId);
    return this.aiProxyService.proxyStream(
      dto.sessionId, dto.message, subjectId, user.schoolId, user.id, res,
    );
  }

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

  @Get('teacher/ai-sessions/:sessionId/messages')
  @Roles('TEACHER', 'SCHOOL_ADMIN')
  getSessionMessages(@CurrentUser() user: any, @Param('sessionId', new ParseUUIDPipe()) sessionId: string) {
    return this.aiProxyService.getSessionMessages(user.schoolId, sessionId, { id: user.id, role: user.role });
  }
}
