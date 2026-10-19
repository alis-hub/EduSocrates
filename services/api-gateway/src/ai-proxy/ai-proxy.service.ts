import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import type { Response } from 'express';
import * as http from 'http';
import * as https from 'https';

const QUOTA_LIMIT = 15;
const QUOTA_WINDOW_MS = 60 * 60 * 1000; // 1 hour

@Injectable()
export class AiProxyService {
  private readonly aiGatewayUrl: string;

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.aiGatewayUrl = config.get<string>('AI_GATEWAY_URL', 'http://localhost:8000');
  }

  async startSession(user: any, courseworkId: string) {
    // Fetch coursework + subject for context injection and quota key
    const rows = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT cw.*, sub.name as subject_name, sub.id as subject_id
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       WHERE cw.id = $1 AND cw.school_id = $2`,
      [courseworkId, user.schoolId],
    );
    if (!rows.length) throw new NotFoundException('Coursework not found');
    const cw = rows[0];

    // Block AI session if guidance mode is DISABLED
    if (cw.ai_guidance_mode === 'DISABLED') {
      throw new HttpException('AI tutoring is disabled for this assignment.', HttpStatus.FORBIDDEN);
    }

    const payload = {
      school_id: user.schoolId,
      student_id: user.id,
      coursework_id: courseworkId,
      subject_name: cw.subject_name,
      assignment_title: cw.title,
      assignment_description: cw.description,
      ai_system_notes: cw.ai_system_notes,
      ai_guidance_mode: cw.ai_guidance_mode,
      teacher_guidance: cw.rubric ?? '',  // Rubric injected as teacher_guidance
    };

    const response = await fetch(`${this.aiGatewayUrl}/api/v1/ai/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new HttpException('AI gateway session start failed', HttpStatus.BAD_GATEWAY);
    }

    const data = await response.json() as { session_id: string };

    // ── Dual-write: persist session record to PostgreSQL ─────────────────── //
    await this.db.queryWithTenant(
      user.schoolId,
      `INSERT INTO ai_tutoring_sessions
         (id, school_id, student_id, coursework_id, session_status, total_tokens_consumed)
       VALUES ($1, $2, $3, $4, 'ACTIVE', 0)
       ON CONFLICT (id) DO NOTHING`,
      [data.session_id, user.schoolId, user.id, courseworkId],
    );

    // Attach subjectId to response so chatStream can use it for per-subject quota
    return { ...data, subjectId: cw.subject_id };
  }

  /**
   * Enforce per-student per-SUBJECT rate limit using Redis.
   * Key: quota:{schoolId}:{studentId}:{subjectId} — 15 msg/hr/subject.
   */
  async checkAndDecrementQuota(schoolId: string, studentId: string, subjectId: string) {
    const key = `quota:${schoolId}:${studentId}:${subjectId}`;
    await this.redisService.checkAndIncrementQuota(key, QUOTA_WINDOW_MS, QUOTA_LIMIT);
  }

  async proxyStream(
    sessionId: string,
    message: string,
    subjectId: string,
    schoolId: string,
    studentId: string,
    res: Response,
  ) {
    const url = new URL(`${this.aiGatewayUrl}/api/v1/ai/chat/stream`);
    const body = JSON.stringify({ session_id: sessionId, student_message: message });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let accumulatedResponse = '';
    let wasIntercepted = false;

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      },
      (proxyRes) => {
        let buffer = '';
        proxyRes.on('data', (chunk: Buffer) => {
          const text = chunk.toString('utf-8');
          buffer += text;
          res.write(chunk);

          // Parse SSE tokens to accumulate assistant response for DB write
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const data = JSON.parse(line.slice(5).trim());
              if (data.intercepted) {
                wasIntercepted = true;
              }
              if (data.token && !data.done) {
                accumulatedResponse += data.token;
              }
            } catch { /* ignore parse errors */ }
          }
        });

        proxyRes.on('end', async () => {
          res.end();
          // ── Dual-write: persist student + assistant messages to PostgreSQL ── //
          if (accumulatedResponse && sessionId) {
            try {
              // Store student message with guardrail flag
              await this.db.queryWithTenant(
                schoolId,
                `INSERT INTO ai_tutoring_messages
                   (session_id, sender_type, content, flagged_jailbreak_attempt, guardrail_response_code)
                 VALUES ($1, 'STUDENT', $2, $3, $4)`,
                [sessionId, message, wasIntercepted, wasIntercepted ? 'GUARDRAIL_INTERCEPTED' : 'EDUCATIONAL'],
              );
              // Store assistant response
              await this.db.queryWithTenant(
                schoolId,
                `INSERT INTO ai_tutoring_messages (session_id, sender_type, content)
                 VALUES ($1, 'ASSISTANT', $2)`,
                [sessionId, accumulatedResponse],
              );

              // Increment token count estimate
              const tokenEstimate = Math.ceil((message.length + accumulatedResponse.length) / 4);
              await this.db.queryWithTenant(
                schoolId,
                `UPDATE ai_tutoring_sessions
                 SET total_tokens_consumed = total_tokens_consumed + $1
                 WHERE id = $2`,
                [tokenEstimate, sessionId],
              );
            } catch (err) {
              // Non-fatal — session already saved in Redis
              console.error('[ai-proxy] DB message persist error:', err);
            }
          }
        });
      },
    );

    req.on('error', () => {
      res.write(`data: {"error": true, "token": "AI service unavailable. Please try again."}\n\n`);
      res.end();
    });
    req.write(body);
    req.end();
  }

  /**
   * Get AI audit log from PostgreSQL (since messages are now dual-written).
   * Supports optional courseworkId and flaggedOnly filters.
   */
  async getAuditLog(
    schoolId: string,
    limit: number,
    filters: { courseworkId?: string; flaggedOnly?: boolean } = {},
  ) {
    const params: any[] = [schoolId, limit];
    const conditions: string[] = [];

    if (filters.courseworkId) {
      params.push(filters.courseworkId);
      conditions.push(`ats.coursework_id = $${params.length}`);
    }
    if (filters.flaggedOnly) {
      conditions.push(`atm.flagged_jailbreak_attempt = TRUE`);
    }

    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

    const entries = await this.db.queryWithTenant(
      schoolId,
      `SELECT atm.id, atm.session_id, atm.sender_type, atm.content as student_message,
              atm.flagged_jailbreak_attempt, atm.guardrail_response_code, atm.created_at,
              ats.student_id, ats.coursework_id, ats.school_id,
              u.first_name, u.last_name,
              cw.title as coursework_title
       FROM ai_tutoring_messages atm
       JOIN ai_tutoring_sessions ats ON ats.id = atm.session_id
       JOIN users u ON u.id = ats.student_id
       JOIN coursework cw ON cw.id = ats.coursework_id
       WHERE ats.school_id = $1 AND atm.sender_type = 'STUDENT' ${whereClause}
       ORDER BY atm.created_at DESC
       LIMIT $2`,
      params,
    );

    const mapped = entries.map((r: any) => ({
      id: r.id,
      session_id: r.session_id,
      sender_type: r.sender_type,
      student_message: r.student_message,
      threat_level: r.flagged_jailbreak_attempt ? 'BLOCKED' : 'SAFE',
      intent_category: r.guardrail_response_code || 'EDUCATIONAL',
      pii_detected: false,
      response_intercepted: Boolean(r.flagged_jailbreak_attempt),
      timestamp: Math.floor(new Date(r.created_at).getTime() / 1000),
      created_at: r.created_at,
      student_id: r.student_id,
      coursework_id: r.coursework_id,
      first_name: r.first_name,
      last_name: r.last_name,
      coursework_title: r.coursework_title,
    }));

    return { school_id: schoolId, total_entries: mapped.length, entries: mapped };
  }

  /** Fetch AI session messages for a specific session (teacher transcript view). */
  async getSessionMessages(sessionId: string) {
    // Try Redis first (live session), fall back to DB
    try {
      const response = await fetch(
        `${this.aiGatewayUrl}/api/v1/ai/sessions/${sessionId}/messages`,
      );
      if (response.ok) {
        const data = await response.json() as any;
        if (data?.messages?.length > 0) return data;
      }
    } catch { /* fall through to DB */ }

    // DB fallback — session may have expired from Redis
    try {
      const messages = await this.db.query(
        `SELECT sender_type, content, created_at
         FROM ai_tutoring_messages
         WHERE session_id = $1
         ORDER BY created_at ASC`,
        [sessionId],
      );
      if (messages && messages.length > 0) {
        return {
          session_id: sessionId,
          messages: messages.map((m: any) => ({
            role: m.sender_type === 'STUDENT' ? 'user' : 'assistant',
            content: m.content,
          })),
          source: 'database',
        };
      }
    } catch { /* ignore and return empty */ }

    return { session_id: sessionId, messages: [], source: 'db_fallback', expired: true };
  }
}

