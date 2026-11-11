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
    const rawUrl = (config.get<string>('AI_GATEWAY_URL') || 'http://localhost:8000')
      .trim()
      .replace(/\/+$/, '');
    this.aiGatewayUrl = rawUrl;
  }

  getAiGatewayUrl(): string {
    return this.aiGatewayUrl;
  }

  async startSession(user: any, courseworkId: string) {
    // Fetch coursework + subject — allow tenant-owned OR public/unlisted coursework
    const rows = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT cw.*, sub.name as subject_name, sub.id as subject_id
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       WHERE cw.id = $1
         AND (
           cw.school_id = $2
           OR cw.is_public = TRUE
           OR cw.access_level IN ('PUBLIC_DIRECTORY', 'UNLISTED')
         )`,
      [courseworkId, user.schoolId],
    );
    if (!rows.length) throw new NotFoundException('Coursework not found');
    const cw = rows[0];

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
      teacher_guidance: cw.rubric ?? '',
      socratic_system_prompt_override: cw.socratic_system_prompt_override ?? null,
      session_type: 'COURSEWORK',
    };

    let response: globalThis.Response;
    try {
      response = await fetch(`${this.aiGatewayUrl}/api/v1/ai/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      console.error('[ai-proxy] Network error reaching AI Gateway at', this.aiGatewayUrl, err);
      throw new HttpException(
        `Unable to reach AI Gateway (${this.aiGatewayUrl}): ${err.message || 'connection failed'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      console.error('[ai-proxy] AI Gateway session start failed:', response.status, errBody);
      throw new HttpException(
        `AI gateway session start failed (${response.status}): ${errBody || response.statusText}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = (await response.json()) as { session_id: string };

    await this.db.queryWithTenant(
      user.schoolId,
      `INSERT INTO ai_tutoring_sessions
         (id, school_id, student_id, coursework_id, session_type, session_status, total_tokens_consumed)
       VALUES ($1, $2, $3, $4, 'COURSEWORK', 'ACTIVE', 0)
       ON CONFLICT (id) DO NOTHING`,
      [data.session_id, user.schoolId, user.id, courseworkId],
    );

    return { ...data, subjectId: cw.subject_id };
  }

  async checkAndDecrementQuota(schoolId: string, studentId: string, subjectId: string) {
    const key = `quota:${schoolId}:${studentId}:${subjectId}`;
    await this.redisService.checkAndIncrementQuota(key, QUOTA_WINDOW_MS, QUOTA_LIMIT);
  }

  /** Generic SSE proxy helper for stateless AI Gateway streaming endpoints (Public Hub & Sandbox). */
  proxySseEndpoint(path: string, payload: Record<string, any>, res: Response) {
    const url = new URL(`${this.aiGatewayUrl}${path}`);
    const body = JSON.stringify(payload);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.request(
      {
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (proxyRes) => {
        proxyRes.on('data', (chunk: Buffer) => res.write(chunk));
        proxyRes.on('end', () => res.end());
      },
    );

    req.on('error', () => {
      res.write(`data: {"error": true, "token": "AI service unavailable. Please try again."}\n\n`);
      res.end();
    });
    req.write(body);
    req.end();
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

          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const data = JSON.parse(line.slice(5).trim());
              if (data.intercepted) wasIntercepted = true;
              if (data.token && !data.done) accumulatedResponse += data.token;
            } catch { /* ignore */ }
          }
        });

        proxyRes.on('end', async () => {
          res.end();
          if (accumulatedResponse && sessionId) {
            try {
              await this.db.queryWithTenant(
                schoolId,
                `INSERT INTO ai_tutoring_messages
                   (session_id, sender_type, content, flagged_jailbreak_attempt, guardrail_response_code)
                 VALUES ($1, 'STUDENT', $2, $3, $4)`,
                [sessionId, message, wasIntercepted, wasIntercepted ? 'GUARDRAIL_INTERCEPTED' : 'EDUCATIONAL'],
              );
              await this.db.queryWithTenant(
                schoolId,
                `INSERT INTO ai_tutoring_messages (session_id, sender_type, content)
                 VALUES ($1, 'ASSISTANT', $2)`,
                [sessionId, accumulatedResponse],
              );
              const tokenEstimate = Math.ceil((message.length + accumulatedResponse.length) / 4);
              await this.db.queryWithTenant(
                schoolId,
                `UPDATE ai_tutoring_sessions
                 SET total_tokens_consumed = total_tokens_consumed + $1
                 WHERE id = $2`,
                [tokenEstimate, sessionId],
              );
            } catch (err) {
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
       LEFT JOIN coursework cw ON cw.id = ats.coursework_id
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
      coursework_title: r.coursework_title || 'Public Hub Session',
    }));

    return { school_id: schoolId, total_entries: mapped.length, entries: mapped };
  }

  async getSessionMessages(sessionId: string) {
    try {
      const response = await fetch(
        `${this.aiGatewayUrl}/api/v1/ai/sessions/${sessionId}/messages`,
      );
      if (response.ok) {
        const data = (await response.json()) as any;
        if (data?.messages?.length > 0) return data;
      }
    } catch { /* fall through to DB */ }

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
    } catch { /* ignore */ }

    return { session_id: sessionId, messages: [], source: 'db_fallback', expired: true };
  }
}
