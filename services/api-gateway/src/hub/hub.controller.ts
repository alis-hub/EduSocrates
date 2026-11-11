import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsArray,
  IsNumber,
  IsInt,
  IsObject,
  Min,
  Max,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard, OptionalJwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { HubService, AuthUser } from './hub.service';

// ─── DTOs ────────────────────────────────────────────────────────────────────

class SchoolLeadDto {
  @IsEmail()
  requesterEmail!: string;

  @IsString()
  @MinLength(2)
  schoolName!: string;

  @IsString()
  campusCity!: string;

  @IsString()
  roleType!: string;
}

class OnboardingWizardDto {
  @IsString()
  @MinLength(2)
  schoolName!: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsEmail()
  adminEmail!: string;

  @IsString()
  @MinLength(6)
  adminPassword!: string;

  @IsString()
  adminFirstName!: string;

  @IsString()
  adminLastName!: string;

  @IsString()
  campusName!: string;

  @IsString()
  campusCity!: string;

  @IsString()
  className!: string;

  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  sectionName?: string;

  @IsString()
  subjectName!: string;

  @IsOptional()
  @IsString()
  inviteCode?: string;
}

class UpdateTeacherSandboxDto {
  @IsOptional()
  @IsString()
  assignmentTitle?: string;

  @IsOptional()
  @IsString()
  assignmentDescription?: string;

  @IsOptional()
  @IsString()
  rubricOrNotes?: string;

  @IsOptional()
  @IsString()
  aiGuidanceMode?: string;
}

class SimulateTeacherSandboxDto {
  @IsString()
  studentPrompt!: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: string; content: string }>;
}

class SandboxStreamDto {
  @IsString()
  topic!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  mode?: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: string; content: string }>;

  @IsOptional()
  @IsString()
  anonSessionKey?: string;
}

class CodeDebugDto {
  @IsString()
  language!: string;

  @IsString()
  code!: string;

  @IsString()
  question!: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsArray()
  history?: Array<{ role: string; content: string }>;

  @IsOptional()
  @IsString()
  anonSessionKey?: string;
}

class FlashcardGenerateDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  subjectArea?: string;

  @IsOptional()
  @IsString()
  courseworkId?: string;

  @IsOptional()
  @IsString()
  assignmentTitle?: string;

  @IsOptional()
  @IsString()
  assignmentDescription?: string;

  @IsOptional()
  @IsString()
  rubric?: string;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(15)
  cardCount?: number;

  @IsOptional()
  @IsBoolean()
  saveDeck?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

class FlashcardInputDto {
  @IsString()
  conceptTitle!: string;

  @IsString()
  clueTier1!: string;

  @IsString()
  clueTier2!: string;

  @IsString()
  terminalDefinition!: string;
}

class CreateDeckDto {
  @IsString()
  title!: string;

  @IsString()
  subjectArea!: string;

  @IsOptional()
  @IsString()
  courseworkId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlashcardInputDto)
  cards!: FlashcardInputDto[];
}

class ReviewCardDto {
  @IsString()
  cardId!: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  quality!: number;
}

class EvaluateConceptDto {
  @IsString()
  nodeId!: string;

  @IsString()
  studentAnswer!: string;
}

class GenerateQuizDto {
  @IsString()
  subject!: string;

  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(15)
  questionCount?: number;

  @IsOptional()
  @IsString()
  courseworkId?: string;

  @IsOptional()
  @IsString()
  courseworkDescription?: string;
}

class SubmitQuizAttemptDto {
  @IsObject()
  selectedAnswers!: Record<string, number>;
}

class CreateThreadDto {
  @IsString()
  title!: string;

  @IsString()
  body!: string;

  @IsOptional()
  @IsString()
  subjectTag?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  askAiGuide?: boolean;
}

class CreateReplyDto {
  @IsString()
  replyBody!: string;

  @IsOptional()
  @IsBoolean()
  summonAiGuide?: boolean;
}

class CreateWhiteboardDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  courseworkId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

class UpdateWhiteboardDto {
  @IsObject()
  canvasState!: { strokes: any[]; notes: any[] };
}

class RecordActivityDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  xpDelta?: number;

  @IsOptional()
  @IsString()
  badgeCode?: string;
}

// ─── Controller ──────────────────────────────────────────────────────────────

@Controller()
export class HubController {
  constructor(private readonly hubService: HubService) {}

  // School Directory & Onboarding Leads
  @Get('public/schools')
  getPublicSchools() {
    return this.hubService.getPublicSchools();
  }

  @Post('leads/school-inquiry')
  createSchoolLead(@Body() dto: SchoolLeadDto) {
    return this.hubService.createSchoolLead(dto);
  }

  @Post('onboarding/wizard')
  onboardingWizard(@Body() dto: OnboardingWizardDto) {
    return this.hubService.onboardingWizard(dto);
  }

  // 2-Hour Ephemeral Teacher Sandbox
  @Post('sandbox/teacher/start')
  startTeacherSandbox() {
    return this.hubService.startTeacherSandbox();
  }

  @Get('sandbox/teacher/:token')
  getTeacherSandbox(@Param('token') token: string) {
    return this.hubService.getTeacherSandbox(token);
  }

  @Patch('sandbox/teacher/:token')
  updateTeacherSandbox(@Param('token') token: string, @Body() dto: UpdateTeacherSandboxDto) {
    return this.hubService.updateTeacherSandbox(token, dto);
  }

  @Post('sandbox/teacher/:token/simulate')
  async simulateTeacherSandbox(
    @Param('token') token: string,
    @Body() dto: SimulateTeacherSandboxDto,
    @Res() res: Response,
  ) {
    await this.hubService.simulateTeacherSandbox(token, dto, res);
  }

  // Hybrid Public Hub Socratic AI Sandbox & Code Debugger
  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/sandbox/stream')
  async streamSandbox(
    @Body() dto: SandboxStreamDto,
    @CurrentUser() user: AuthUser | null,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientIp = req.ip || req.socket.remoteAddress || 'anon';
    await this.hubService.streamSandbox(dto, user, clientIp, res);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/code/debug-socratic')
  async streamCodeDebug(
    @Body() dto: CodeDebugDto,
    @CurrentUser() user: AuthUser | null,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const clientIp = req.ip || req.socket.remoteAddress || 'anon';
    await this.hubService.streamCodeDebug(dto, user, clientIp, res);
  }

  // Flashcards & SM-2
  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/flashcards/decks')
  getDecks(
    @CurrentUser() user: AuthUser | null,
    @Query('courseworkId') courseworkId?: string,
    @Query('subjectArea') subjectArea?: string,
  ) {
    return this.hubService.getFlashcardDecks(user, courseworkId, subjectArea);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/flashcards/decks/:deckId')
  getDeckById(@Param('deckId') deckId: string, @CurrentUser() user: AuthUser | null) {
    return this.hubService.getFlashcardDeckById(deckId, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/flashcards/generate')
  generateFlashcards(@Body() dto: FlashcardGenerateDto, @CurrentUser() user: AuthUser | null) {
    return this.hubService.generateFlashcardsAi(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hub/flashcards/decks')
  createDeck(@Body() dto: CreateDeckDto, @CurrentUser() user: AuthUser) {
    return this.hubService.createFlashcardDeck(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hub/flashcards/review')
  reviewCard(@Body() dto: ReviewCardDto, @CurrentUser() user: AuthUser) {
    return this.hubService.reviewFlashcard(dto, user);
  }

  // Knowledge Maps (DAG)
  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/concepts/nodes')
  getConceptNodes(@Query('domain') domain: string | undefined, @CurrentUser() user: AuthUser | null) {
    return this.hubService.getConceptNodes(domain, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/concepts/evaluate')
  evaluateConcept(@Body() dto: EvaluateConceptDto, @CurrentUser() user: AuthUser | null) {
    return this.hubService.evaluateConceptCheckpoint(dto.nodeId, dto.studentAnswer, user);
  }

  // Practice Quizzes
  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/quizzes')
  getQuizzes(@CurrentUser() user: AuthUser | null, @Query('subject') subject?: string) {
    return this.hubService.getPracticeQuizzes(user, subject);
  }

  @Get('hub/quizzes/:quizId')
  getQuizById(@Param('quizId') quizId: string) {
    return this.hubService.getPracticeQuizById(quizId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/quizzes/generate')
  generateQuiz(@Body() dto: GenerateQuizDto, @CurrentUser() user: AuthUser | null) {
    return this.hubService.generatePracticeQuiz(dto, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/quizzes/:quizId/attempt')
  submitQuizAttempt(
    @Param('quizId') quizId: string,
    @Body() dto: SubmitQuizAttemptDto,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.hubService.submitPracticeQuizAttempt(quizId, dto.selectedAnswers, user);
  }

  // Peer Discussions
  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/discussions/threads')
  getThreads(@CurrentUser() user: AuthUser | null, @Query('subjectTag') subjectTag?: string) {
    return this.hubService.getDiscussionThreads(user, subjectTag);
  }

  @Get('hub/discussions/threads/:threadId')
  getThreadById(@Param('threadId') threadId: string) {
    return this.hubService.getDiscussionThreadById(threadId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hub/discussions/threads')
  createThread(@Body() dto: CreateThreadDto, @CurrentUser() user: AuthUser) {
    return this.hubService.createDiscussionThread(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hub/discussions/threads/:threadId/replies')
  createReply(
    @Param('threadId') threadId: string,
    @Body() dto: CreateReplyDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.hubService.createDiscussionReply(threadId, dto, user);
  }

  // Collaborative Whiteboards
  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/whiteboard/rooms')
  getWhiteboardRooms(
    @CurrentUser() user: AuthUser | null,
    @Query('courseworkId') courseworkId?: string,
  ) {
    return this.hubService.getWhiteboardRooms(user, courseworkId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('hub/whiteboard/session/create')
  createWhiteboardRoom(@Body() dto: CreateWhiteboardDto, @CurrentUser() user: AuthUser | null) {
    return this.hubService.createWhiteboardRoom(dto, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get('hub/whiteboard/:roomId')
  getWhiteboardRoom(@Param('roomId') roomId: string, @CurrentUser() user: AuthUser | null) {
    return this.hubService.getWhiteboardRoom(roomId, user);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Put('hub/whiteboard/:roomId')
  updateWhiteboardState(@Param('roomId') roomId: string, @Body() dto: UpdateWhiteboardDto) {
    return this.hubService.updateWhiteboardState(roomId, dto.canvasState);
  }

  // Gamification
  @UseGuards(JwtAuthGuard)
  @Get('hub/gamification/profile')
  getGamificationProfile(@CurrentUser() user: AuthUser) {
    return this.hubService.getGamificationProfile(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('hub/gamification/record-activity')
  recordActivity(@Body() dto: RecordActivityDto, @CurrentUser() user: AuthUser) {
    return this.hubService.recordActivity(user.id, dto.xpDelta ?? 10, dto.badgeCode);
  }
}
