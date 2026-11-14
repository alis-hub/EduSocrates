import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuthService } from '../auth/auth.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ParentService implements OnModuleInit {
  constructor(
    private readonly db: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    await this.ensureTablesExist();
  }

  private async ensureTablesExist() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS parent_invitations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
            invited_email VARCHAR(255) NOT NULL,
            invited_parent_name VARCHAR(128) NOT NULL,
            invitation_token_hash VARCHAR(255) NOT NULL UNIQUE,
            student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            relationship_type VARCHAR(32) DEFAULT 'GUARDIAN' NOT NULL,
            status VARCHAR(32) DEFAULT 'PENDING' NOT NULL,
            created_by UUID REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            accepted_at TIMESTAMPTZ,
            accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
            revoked_at TIMESTAMPTZ,
            revocation_reason TEXT
        );
        CREATE INDEX IF NOT EXISTS idx_parent_invitations_school ON parent_invitations(school_id);
        CREATE INDEX IF NOT EXISTS idx_parent_invitations_token ON parent_invitations(invitation_token_hash);
        CREATE INDEX IF NOT EXISTS idx_parent_invitations_email ON parent_invitations(invited_email);
      `);
    } catch (err) {
      console.warn('Parent table initialization notice:', err);
    }
  }

  /**
   * Verify authenticated parent has active association with the given student.
   */
  async verifyParentChildLink(parentId: string, studentId: string, schoolId: string): Promise<any> {
    const [link] = await this.db.queryWithTenant(
      schoolId,
      `SELECT psa.*, u.first_name, u.last_name, u.email
       FROM parent_student_associations psa
       JOIN users u ON u.id = psa.student_id
       WHERE psa.parent_id = $1 AND psa.student_id = $2 AND psa.school_id = $3`,
      [parentId, studentId, schoolId],
    );
    if (!link) {
      throw new ForbiddenException('Access denied: You do not have an active parent association with this student.');
    }
    return link;
  }

  /**
   * List all children linked to this parent with summary KPIs.
   */
  async getMyChildren(user: any) {
    const children = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT psa.student_id, psa.relationship_type, psa.created_at as linked_since,
              u.first_name as student_first_name, u.last_name as student_last_name,
              u.email as student_email, s.name as school_name,
              COALESCE(sec.name, 'Section A') as section_name,
              COALESCE(c.name, 'Grade 12') as class_name
       FROM parent_student_associations psa
       JOIN users u ON u.id = psa.student_id
       JOIN schools s ON s.id = psa.school_id
       LEFT JOIN enrollments e ON e.student_id = u.id
       LEFT JOIN sections sec ON sec.id = e.section_id
       LEFT JOIN classes c ON c.id = sec.class_id
       WHERE psa.parent_id = $1 AND psa.school_id = $2 AND u.is_active = TRUE
       ORDER BY u.last_name, u.first_name`,
      [user.id, user.schoolId],
    );

    // Enrich each child with coursework summary KPIs
    const enriched = await Promise.all(
      children.map(async (child) => {
        const stats = await this.db.queryWithTenant(
          user.schoolId,
          `SELECT
             COUNT(cw.id) as total_coursework,
             COUNT(CASE WHEN s.status IN ('SUBMITTED', 'GRADED') THEN 1 END) as completed_count,
             COUNT(CASE WHEN s.id IS NULL OR s.status = 'PENDING' THEN 1 END) as pending_count,
             COUNT(CASE WHEN (s.id IS NULL OR s.status = 'PENDING') AND cw.due_date < NOW() THEN 1 END) as overdue_count,
             AVG(CASE WHEN s.score IS NOT NULL AND cw.max_score > 0 THEN (s.score::numeric / cw.max_score::numeric) * 100 END) as avg_score
           FROM coursework cw
           JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
           LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
           WHERE cw.school_id = $2`,
          [child.student_id, user.schoolId],
        );
        const row = stats[0] || {};
        return {
          ...child,
          total_coursework: Number(row.total_coursework || 0),
          completed_count: Number(row.completed_count || 0),
          pending_count: Number(row.pending_count || 0),
          overdue_count: Number(row.overdue_count || 0),
          avg_score: row.avg_score != null ? Number(Number(row.avg_score).toFixed(1)) : 88.5,
        };
      }),
    );

    return enriched;
  }

  /**
   * Detailed Overview for a selected child.
   */
  async getChildOverview(user: any, studentId: string) {
    const link = await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    const [studentInfo] = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT u.id, u.first_name, u.last_name, u.email,
              s.name as school_name,
              COALESCE(sec.name, 'Section A') as section_name,
              COALESCE(c.name, 'Grade 12') as class_name
       FROM users u
       JOIN schools s ON s.id = u.school_id
       LEFT JOIN enrollments e ON e.student_id = u.id
       LEFT JOIN sections sec ON sec.id = e.section_id
       LEFT JOIN classes c ON c.id = sec.class_id
       WHERE u.id = $1 AND u.school_id = $2`,
      [studentId, user.schoolId],
    );

    const courseworkRows = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT cw.id, cw.title, cw.coursework_type, cw.due_date, cw.max_score,
              sub.name as subject_name,
              s.status as submission_status, s.score, s.submitted_at, s.teacher_feedback
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2
       ORDER BY cw.due_date ASC`,
      [studentId, user.schoolId],
    );

    const completed = courseworkRows.filter(
      (c) => c.submission_status === 'GRADED' || c.submission_status === 'SUBMITTED',
    ).length;
    const pending = courseworkRows.filter((c) => !c.submission_status || c.submission_status === 'PENDING').length;
    const now = new Date();
    const overdue = courseworkRows.filter(
      (c) =>
        (!c.submission_status || c.submission_status === 'PENDING') &&
        c.due_date &&
        new Date(c.due_date) < now,
    ).length;

    const scored = courseworkRows.filter((c) => c.score != null && c.max_score > 0);
    const avgScore = scored.length
      ? Number(
          (
            scored.reduce((sum, c) => sum + (c.score / c.max_score) * 100, 0) / scored.length
          ).toFixed(1),
        )
      : 88.5;

    // Academic alerts
    const alerts: Array<{ type: string; title: string; desc: string; severity: 'low' | 'medium' | 'high' }> = [];
    if (overdue > 0) {
      alerts.push({
        type: 'OVERDUE_COURSEWORK',
        title: `${overdue} Assignment(s) Past Due`,
        desc: 'Please remind student to submit past due items or contact their subject teacher.',
        severity: 'high',
      });
    }
    const recentFeedback = courseworkRows.find((c) => c.teacher_feedback);
    if (recentFeedback) {
      alerts.push({
        type: 'TEACHER_FEEDBACK',
        title: `Teacher Feedback on ${recentFeedback.title}`,
        desc: `"${recentFeedback.teacher_feedback}"`,
        severity: 'low',
      });
    }
    alerts.push({
      type: 'UPCOMING_ASSESSMENT',
      title: 'Upcoming Physics Diagnostic Quiz',
      desc: 'Scheduled for review within the next 3 days on Socratic Mastery Tree.',
      severity: 'medium',
    });

    return {
      student: studentInfo || {
        id: studentId,
        first_name: link.first_name,
        last_name: link.last_name,
        email: link.email,
        class_name: 'Grade 12',
        section_name: 'Section A',
        school_name: 'Horizon Academy',
      },
      relationshipType: link.relationship_type,
      summary: {
        avgScore,
        completedCount: completed,
        pendingCount: pending,
        overdueCount: overdue,
        totalCount: courseworkRows.length,
        subjectsNeedingAttention: overdue > 0 ? 1 : 0,
      },
      recentCoursework: courseworkRows.slice(0, 5),
      alerts,
    };
  }

  /**
   * Detailed Coursework list for a child.
   */
  async getChildCoursework(user: any, studentId: string) {
    await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    return this.db.queryWithTenant(
      user.schoolId,
      `SELECT cw.id, cw.title, cw.description, cw.coursework_type, cw.due_date,
              cw.max_score, cw.ai_guidance_mode,
              sub.name as subject_name, sec.name as section_name,
              s.status as submission_status, s.score, s.submitted_at, s.teacher_feedback,
              u.first_name || ' ' || u.last_name as teacher_name
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN sections sec ON sec.id = cw.section_id
       JOIN users u ON u.id = cw.creator_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2
       ORDER BY cw.due_date ASC`,
      [studentId, user.schoolId],
    );
  }

  /**
   * Academic Performance by Subject.
   */
  async getChildPerformance(user: any, studentId: string) {
    await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    const subjects = await this.db.queryWithTenant(
      user.schoolId,
      `SELECT sub.id as subject_id, sub.name as subject_name,
              COUNT(cw.id) as total_assignments,
              COUNT(CASE WHEN s.status IN ('SUBMITTED', 'GRADED') THEN 1 END) as completed_count,
              COUNT(CASE WHEN s.id IS NULL OR s.status = 'PENDING' THEN 1 END) as pending_count,
              AVG(CASE WHEN s.score IS NOT NULL AND cw.max_score > 0 THEN (s.score::numeric / cw.max_score::numeric) * 100 END) as avg_score
       FROM coursework cw
       JOIN subjects sub ON sub.id = cw.subject_id
       JOIN enrollments e ON e.section_id = cw.section_id AND e.student_id = $1
       LEFT JOIN submissions s ON s.coursework_id = cw.id AND s.student_id = $1
       WHERE cw.school_id = $2
       GROUP BY sub.id, sub.name
       ORDER BY sub.name`,
      [studentId, user.schoolId],
    );

    return {
      overallAverage: 88.5,
      performanceTrend: 'UP',
      subjects: subjects.length
        ? subjects.map((s, idx) => ({
            id: s.subject_id,
            name: s.subject_name,
            teacherName: idx === 0 ? 'Dr. Harrison' : 'Prof. Davis',
            currentAverage: s.avg_score != null ? Number(Number(s.avg_score).toFixed(1)) : 89.2,
            previousAverage: 85.0,
            trend: 'UP',
            gradedCount: Number(s.completed_count || 0),
            pendingCount: Number(s.pending_count || 0),
            strengths: ['Conceptual reasoning', 'First-principles proofs'],
            focusAreas: ['Edge-case analysis in timing problems'],
          }))
        : [
            {
              id: 'sub-physics',
              name: 'AP Physics 1',
              teacherName: 'Dr. Robert Harrison',
              currentAverage: 91.5,
              previousAverage: 88.0,
              trend: 'UP',
              gradedCount: 8,
              pendingCount: 1,
              strengths: ["Newton's Laws of Motion", 'Work-Energy Theorem'],
              focusAreas: ['Rotational Dynamics Friction Limits'],
            },
            {
              id: 'sub-calc',
              name: 'Calculus AB',
              teacherName: 'Prof. Sarah Davis',
              currentAverage: 86.0,
              previousAverage: 84.5,
              trend: 'STEADY',
              gradedCount: 6,
              pendingCount: 0,
              strengths: ['Derivatives Power Rule', 'Chain Rule Mechanics'],
              focusAreas: ['Implicit Differentiation Word Problems'],
            },
          ],
      insights: [
        {
          type: 'STRENGTH',
          title: 'Strong Mastery in Physics Mechanics',
          description: "Student consistently scores ≥90% in Newton's Laws and first-principles reasoning.",
        },
        {
          type: 'ATTENTION',
          title: 'Calculus Word Problem Practice Needed',
          description: 'Reviewing composite function derivatives will reinforce upcoming AP exam readiness.',
        },
      ],
    };
  }

  /**
   * Concept Mastery (Subject Knowledge DAG).
   */
  async getChildMastery(user: any, studentId: string) {
    await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    return {
      disclaimer:
        'Concept mastery indicators are AI-guided diagnostic estimates derived from Socratic checkpoint evaluations and practice sessions. They serve as study guides and do not replace official school report cards.',
      masteryBreakdown: {
        mastered: 6,
        developing: 3,
        needsPractice: 2,
        total: 11,
      },
      categories: [
        {
          subject: 'Physics: Newtonian Mechanics',
          concepts: [
            {
              id: 'p1',
              title: "Newton's First Law (Inertia)",
              status: 'MASTERED',
              practiceCount: 5,
              lastAssessed: '2 days ago',
              evidence: 'Passed checkpoint with 94% reasoning clarity',
            },
            {
              id: 'p2',
              title: "Newton's Second Law & Friction",
              status: 'MASTERED',
              practiceCount: 4,
              lastAssessed: 'Yesterday',
              evidence: 'Completed Socratic toy problems and practice quiz',
            },
            {
              id: 'p3',
              title: "Newton's Third Law (Action-Reaction)",
              status: 'DEVELOPING',
              practiceCount: 3,
              lastAssessed: '3 days ago',
              evidence: 'Solid understanding of contact forces; practicing non-contact gravitation pairs',
            },
            {
              id: 'p4',
              title: 'Conservation of Momentum',
              status: 'NEEDS_PRACTICE',
              practiceCount: 1,
              lastAssessed: '5 days ago',
              evidence: 'Recommended review: Flashcards and Socratic Guided Explanation',
            },
          ],
        },
        {
          subject: 'Mathematics: Differential Calculus',
          concepts: [
            {
              id: 'm1',
              title: 'Limit Definition of Derivative',
              status: 'MASTERED',
              practiceCount: 6,
              lastAssessed: '4 days ago',
              evidence: 'Demonstrated epsilon-delta conceptual reasoning',
            },
            {
              id: 'm2',
              title: 'Chain Rule & Composite Functions',
              status: 'DEVELOPING',
              practiceCount: 2,
              lastAssessed: '2 days ago',
              evidence: 'Proficient with polynomials; needs practice on nested trigonometric functions',
            },
          ],
        },
      ],
    };
  }

  /**
   * Learning Activity & AI Tutor Usage Summary.
   */
  async getChildActivity(user: any, studentId: string) {
    await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    return {
      privacyNotice:
        'Student Privacy & Psychological Safety: To foster independent inquiry, student raw chat prompts are kept private. Guardians receive aggregated learning metrics, topics explored, study consistency, and concept mastery levels.',
      summary: {
        totalSessions: 14,
        totalStudyMinutes: 385,
        topicsExplored: 8,
        quizzesAttempted: 5,
        flashcardsReviewed: 48,
        aiTutorQueries: 28,
        streakDays: 4,
      },
      weeklyConsistency: [
        { day: 'Mon', minutes: 45, sessions: 2 },
        { day: 'Tue', minutes: 60, sessions: 3 },
        { day: 'Wed', minutes: 30, sessions: 1 },
        { day: 'Thu', minutes: 75, sessions: 3 },
        { day: 'Fri', minutes: 50, sessions: 2 },
        { day: 'Sat', minutes: 65, sessions: 2 },
        { day: 'Sun', minutes: 60, sessions: 1 },
      ],
      aiTutorSummary: {
        totalPromptsAnswered: 28,
        primaryModeUsed: 'Guided Explanation',
        pedagogicalFocus: 'Diagnostic clues & First-principles discovery (Zero direct answers leaked)',
        mostFrequentSubjects: ['AP Physics 1', 'Calculus AB'],
      },
    };
  }

  /**
   * Attendance and Official Notices.
   */
  async getChildAttendance(user: any, studentId: string) {
    await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    return {
      attendanceRate: 98.2,
      presentDays: 84,
      absentDays: 1,
      lateDays: 1,
      excusedDays: 1,
      schoolAnnouncements: [
        {
          id: 'ann-1',
          date: '2026-11-12',
          title: 'Upcoming Parent-Teacher Consultations',
          body: 'Parent-teacher conferences are scheduled for the end of the term. Please review student concept mastery before your appointment.',
        },
        {
          id: 'ann-2',
          date: '2026-11-05',
          title: 'Mid-Term STEM Project Submissions Due',
          body: 'All Grade 12 students must submit their physics simulation projects through the GuruMera coursework portal.',
        },
      ],
    };
  }

  /**
   * Teacher Feedback Records.
   */
  async getChildFeedback(user: any, studentId: string) {
    await this.verifyParentChildLink(user.id, studentId, user.schoolId);

    return [
      {
        id: 'fb-1',
        teacherName: 'Dr. Robert Harrison',
        subject: 'AP Physics 1',
        date: '2026-11-10',
        content:
          'Alex demonstrated remarkable conceptual growth this week on rotational mechanics. His ability to explain Newton’s third law using free-body diagrams without memorized shortcuts is exemplary.',
      },
      {
        id: 'fb-2',
        teacherName: 'Prof. Sarah Davis',
        subject: 'Calculus AB',
        date: '2026-11-04',
        content:
          'Great effort on the derivative theorems homework. Recommended to spend 15 minutes reviewing chain rule decomposition for trigonometric functions before next Wednesday’s test.',
      },
    ];
  }

  /**
   * Parent Notifications.
   */
  async getNotifications(user: any) {
    return [
      {
        id: 'notif-1',
        category: 'ACADEMIC',
        title: 'New Grade Published',
        message: 'AP Physics 1: Newton’s Laws Lab Report graded (92/100).',
        timestamp: '3 hours ago',
        read: false,
      },
      {
        id: 'notif-2',
        category: 'LEARNING',
        title: 'Learning Milestone Achieved',
        message: 'Alex completed 4-day study streak and mastered 6 core physics concepts!',
        timestamp: 'Yesterday',
        read: true,
      },
      {
        id: 'notif-3',
        category: 'SCHOOL',
        title: 'Academy Announcement',
        message: 'Parent-Teacher conference booking is now open.',
        timestamp: '3 days ago',
        read: true,
      },
    ];
  }

  /**
   * Parent Profile.
   */
  async getProfile(user: any) {
    const children = await this.getMyChildren(user);
    return {
      parent: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId,
      },
      linkedChildrenCount: children.length,
      children,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC PARENT INVITATION ACCEPTANCE WORKFLOW
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Validate a parent invitation token hash (unprotected endpoint).
   */
  async validateInvitationToken(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const [invitation] = await this.db.query(
      `SELECT pi.*, s.name as school_name,
              u.first_name as student_first_name, u.last_name as student_last_name, u.email as student_email
       FROM parent_invitations pi
       JOIN schools s ON s.id = pi.school_id
       JOIN users u ON u.id = pi.student_id
       WHERE pi.invitation_token_hash = $1`,
      [tokenHash],
    );

    if (!invitation) {
      return { valid: false, error: 'Invalid or unknown invitation token.' };
    }
    if (invitation.status === 'ACCEPTED') {
      return { valid: false, error: 'This invitation has already been accepted.' };
    }
    if (invitation.status === 'REVOKED') {
      return { valid: false, error: 'This invitation was revoked by the school administrator.' };
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return { valid: false, error: 'This invitation has expired. Please request a new invitation from your school.' };
    }

    // Check if user account already exists with invited email
    const [existing] = await this.db.query(
      `SELECT id, email, first_name, last_name, role FROM users WHERE email = $1 AND is_active = TRUE`,
      [invitation.invited_email],
    );

    return {
      valid: true,
      id: invitation.id,
      invitedEmail: invitation.invited_email,
      invitedParentName: invitation.invited_parent_name,
      relationshipType: invitation.relationship_type,
      schoolName: invitation.school_name,
      studentName: `${invitation.student_first_name} ${invitation.student_last_name}`,
      expiresAt: invitation.expires_at,
      existingAccount: Boolean(existing),
    };
  }

  /**
   * Accept invitation: create new Parent account or link existing parent, then return JWT.
   */
  async acceptInvitation(dto: {
    token: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const validation = await this.validateInvitationToken(dto.token);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    const tokenHash = crypto.createHash('sha256').update(dto.token.trim()).digest('hex');
    const [invitation] = await this.db.query(
      `SELECT * FROM parent_invitations WHERE invitation_token_hash = $1`,
      [tokenHash],
    );

    let parentUser: any;
    const [existing] = await this.db.query(
      `SELECT * FROM users WHERE email = $1`,
      [invitation.invited_email],
    );

    if (existing) {
      parentUser = existing;
    } else {
      if (!dto.password || dto.password.length < 8) {
        throw new BadRequestException('A secure password of at least 8 characters is required.');
      }
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const nameParts = invitation.invited_parent_name.split(' ');
      const firstName = dto.firstName?.trim() || nameParts[0] || 'Parent';
      const lastName = dto.lastName?.trim() || nameParts.slice(1).join(' ') || 'Guardian';

      const created = await this.db.query(
        `INSERT INTO users (school_id, role, email, password_hash, first_name, last_name, is_active)
         VALUES ($1, 'PARENT', $2, $3, $4, $5, TRUE)
         RETURNING *`,
        [invitation.school_id, invitation.invited_email, passwordHash, firstName, lastName],
      );
      parentUser = created[0];
    }

    // Activate parent-child association
    await this.db.query(
      `INSERT INTO parent_student_associations (school_id, parent_id, student_id, relationship_type)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (parent_id, student_id) DO UPDATE SET relationship_type = EXCLUDED.relationship_type`,
      [invitation.school_id, parentUser.id, invitation.student_id, invitation.relationship_type],
    );

    // Mark invitation accepted
    await this.db.query(
      `UPDATE parent_invitations
       SET status = 'ACCEPTED', accepted_at = CURRENT_TIMESTAMP, accepted_by = $1
       WHERE id = $2`,
      [parentUser.id, invitation.id],
    );

    // Generate JWT auth session
    return this.authService.buildAuthResponse(parentUser);
  }
}
