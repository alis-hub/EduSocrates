-- EduSocrates Multi-Tenant Seed Data
-- Password for seeded accounts is: Password123!
-- Bcrypt hash for Password123! (10 rounds): $2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a

-- 1. Tenants (Schools)
INSERT INTO schools (id, slug, name, domain, subscription_status)
VALUES 
    -- Platform pseudo-school for Super Admin
    ('00000000-0000-0000-0000-000000000000', 'platform', 'EduSocrates Platform', 'edusocrates.io', 'ACTIVE'),
    ('11111111-1111-4111-a111-111111111111', 'horizon-academy', 'Horizon International Academy', 'horizon.edu', 'ACTIVE'),
    ('22222222-2222-4222-a222-222222222222', 'apex-science', 'Apex Science Institute', 'apex.edu', 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Campuses
INSERT INTO campuses (id, school_id, name, address)
VALUES
    ('c1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'Main Campus - North', '100 Horizon Blvd, North City'),
    ('c1111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', 'South Innovation Center', '200 Horizon Way, South City'),
    ('c2222222-2222-4222-a222-222222222221', '22222222-2222-4222-a222-222222222222', 'Apex Central Campus', '50 Science Park, Apex City')
ON CONFLICT (id) DO NOTHING;

-- 3. Academic Years
INSERT INTO academic_years (id, school_id, name, start_date, end_date, is_active)
VALUES
    ('a1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '2026-2027', '2026-08-15', '2027-06-15', TRUE),
    ('a2222222-2222-4222-a222-222222222222', '22222222-2222-4222-a222-222222222222', '2026-2027', '2026-09-01', '2027-06-30', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Classes
INSERT INTO classes (id, school_id, campus_id, name, code)
VALUES
    ('b1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'Grade 10', 'G10'),
    ('b1111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'Grade 11', 'G11')
ON CONFLICT (id) DO NOTHING;

-- 5. Sections
INSERT INTO sections (id, school_id, class_id, name, capacity)
VALUES
    ('d1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'b1111111-1111-4111-a111-111111111111', 'Section A', 30),
    ('d1111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', 'b1111111-1111-4111-a111-111111111111', 'Section B', 30)
ON CONFLICT (id) DO NOTHING;

-- 6. Subjects
INSERT INTO subjects (id, school_id, class_id, name, code)
VALUES
    ('f1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', 'b1111111-1111-4111-a111-111111111111', 'AP Physics 1', 'PHYS-101'),
    ('f1111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', 'b1111111-1111-4111-a111-111111111111', 'Calculus AB', 'MATH-201')
ON CONFLICT (id) DO NOTHING;

-- 7. Users
INSERT INTO users (id, school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
VALUES
    -- Super Admin (platform-level)
    ('00000001-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000', NULL, 'SUPER_ADMIN', 'superadmin@edusocrates.io', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Platform', 'Admin', TRUE),
    -- Horizon Admin
    ('11111111-1111-4111-a111-111111110001', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'SCHOOL_ADMIN', 'admin@horizon.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Sarah', 'Jenkins', TRUE),
    -- Horizon Teacher
    ('11111111-1111-4111-a111-111111110002', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'TEACHER', 'teacher.physics@horizon.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Dr. Marcus', 'Vance', TRUE),
    -- Horizon Student
    ('11111111-1111-4111-a111-111111110003', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'STUDENT', 'alex.chen@horizon.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Alex', 'Chen', TRUE),
    -- Horizon Parent
    ('11111111-1111-4111-a111-111111110004', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'PARENT', 'parent@horizon.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Eleanor', 'Chen', TRUE),
    -- Apex Admin (Tenant B)
    ('22222222-2222-4222-a222-222222220001', '22222222-2222-4222-a222-222222222222', 'c2222222-2222-4222-a222-222222222221', 'SCHOOL_ADMIN', 'admin@apex.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Arthur', 'Pendleton', TRUE)
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 8. Parent-Student Associations
INSERT INTO parent_student_associations (id, school_id, parent_id, student_id, relationship_type)
VALUES
    ('ea111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111110004', '11111111-1111-4111-a111-111111110003', 'MOTHER')
ON CONFLICT (parent_id, student_id) DO NOTHING;

-- 9. Teacher Allocations
INSERT INTO teacher_subject_allocations (id, school_id, teacher_id, subject_id, section_id)
VALUES
    ('eb111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111110002', 'f1111111-1111-4111-a111-111111111111', 'd1111111-1111-4111-a111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 10. Student Enrollment
INSERT INTO enrollments (id, school_id, student_id, section_id, academic_year_id)
VALUES
    ('e1111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111110003', 'd1111111-1111-4111-a111-111111111111', 'a1111111-1111-4111-a111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- 11. Sample Coursework
INSERT INTO coursework (id, school_id, section_id, subject_id, creator_id, title, description, coursework_type, max_score, due_date, ai_guidance_mode, ai_system_notes, rubric, time_limit_minutes)
VALUES
    (
        'ca111111-1111-4111-a111-111111111111',
        '11111111-1111-4111-a111-111111111111',
        'd1111111-1111-4111-a111-111111111111',
        'f1111111-1111-4111-a111-111111111111',
        '11111111-1111-4111-a111-111111110002',
        'Newtonian Dynamics & Conservation of Momentum',
        'A 1200 kg car traveling east at 25 m/s collides with a 1800 kg truck traveling north at 15 m/s. Calculate the magnitude and direction of the resultant velocity vector assuming a completely inelastic collision. Show all conservation steps.',
        'HOMEWORK',
        100.00,
        NOW() + INTERVAL '7 days',
        'SOCRATIC_STRICT',
        'Help students break down vectors into orthogonal x and y momentum components before calculating the final angle with arctan. Do NOT calculate the hypotenuse or resultant angle for them. Target momentum: P_x = 30000 kg*m/s, P_y = 27000 kg*m/s.',
        '40pts: Correct momentum vector decomposition. 30pts: Inelastic collision equation setup. 30pts: Final magnitude & direction with units.',
        NULL
    ),
    (
        'ca111111-1111-4111-a111-111111111112',
        '11111111-1111-4111-a111-111111111111',
        'd1111111-1111-4111-a111-111111111111',
        'f1111111-1111-4111-a111-111111111112',
        '11111111-1111-4111-a111-111111110002',
        'Limits and Continuity Diagnostic Quiz',
        'Evaluate the limit as x approaches 0 of (sin(3x)) / (5x). Explain the analytical rationale using standard trigonometric limit theorems.',
        'QUIZ',
        50.00,
        NOW() + INTERVAL '3 days',
        'TERMINOLOGY_ONLY',
        'Encourage students to recall lim (u->0) sin(u)/u = 1. Guide them to multiply and divide by appropriate constants. Final answer is 3/5.',
        '25pts: Accurate algebraic manipulation. 25pts: Rigorous citation of limit theorem.',
        15
    )
ON CONFLICT (id) DO NOTHING;

-- 12. Sample Submissions
INSERT INTO submissions (id, school_id, coursework_id, student_id, submission_text, score, teacher_feedback, status)
VALUES
    (
        'fa111111-1111-4111-a111-111111111111',
        '11111111-1111-4111-a111-111111111111',
        'ca111111-1111-4111-a111-111111111111',
        '11111111-1111-4111-a111-111111110003',
        'Total momentum in X: P_x = 1200 * 25 = 30000 kg*m/s. Total momentum in Y: P_y = 1800 * 15 = 27000 kg*m/s. Total mass = 3000 kg. V_x = 10 m/s, V_y = 9 m/s. Resultant V = sqrt(10^2 + 9^2) = 13.45 m/s at 42.0 degrees North of East.',
        95.00,
        'Excellent work, Alex! Your step-by-step decomposition was very clear and rigorous.',
        'GRADED'
    )
ON CONFLICT (coursework_id, student_id) DO NOTHING;

-- 13. Sample Socratic AI Tutoring Sessions & Messages
INSERT INTO ai_tutoring_sessions (id, school_id, student_id, coursework_id, session_status, total_tokens_consumed)
VALUES
    (
        'da111111-1111-4111-a111-111111111111',
        '11111111-1111-4111-a111-111111111111',
        '11111111-1111-4111-a111-111111110003',
        'ca111111-1111-4111-a111-111111111111',
        'ACTIVE',
        320
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_tutoring_messages (id, session_id, sender_type, content, flagged_jailbreak_attempt, guardrail_response_code)
VALUES
    (
        'ba111111-1111-4111-a111-111111111111',
        'da111111-1111-4111-a111-111111111111',
        'STUDENT',
        'I am stuck on how to combine the two velocities since they are perpendicular.',
        FALSE,
        'EDUCATIONAL'
    ),
    (
        'ba111111-1111-4111-a111-111111111112',
        'da111111-1111-4111-a111-111111111111',
        'ASSISTANT',
        'Great question! Remember that momentum is a vector quantity. What happens if you look at the horizontal (east) and vertical (north) directions as two independent components first?',
        FALSE,
        NULL
    )
ON CONFLICT (id) DO NOTHING;
