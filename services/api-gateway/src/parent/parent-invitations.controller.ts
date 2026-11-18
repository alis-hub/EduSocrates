import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ParentService } from './parent.service';
import { RateLimit, RateLimitGuard } from '../common/rate-limit';

class AcceptInvitationDto {
  @IsString() @IsNotEmpty() @MaxLength(256) token: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(72) password?: string;
  @IsOptional() @IsString() @MaxLength(100) firstName?: string;
  @IsOptional() @IsString() @MaxLength(100) lastName?: string;
}

/**
 * Public Parent Invitation endpoints used by parents opening a school-issued invitation link.
 * Rate limited per IP so tokens cannot be guessed.
 */
@Controller('parent-invitations')
@UseGuards(RateLimitGuard)
export class ParentInvitationsController {
  constructor(private readonly parentService: ParentService) {}

  @Get('validate/:token')
  @RateLimit({ name: 'invite-validate', limit: 60, windowMs: 60 * 60 * 1000 })
  async validateToken(@Param('token') token: string) {
    return this.parentService.validateInvitationToken(token);
  }

  @Post('accept')
  @RateLimit({ name: 'invite-accept', limit: 20, windowMs: 60 * 60 * 1000 })
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.parentService.acceptInvitation(dto);
  }
}
