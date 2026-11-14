-- EduSocrates Multi-Tenant Seed Data
-- Password for seeded accounts is: Password123!
-- Bcrypt hash for Password123! (10 rounds): $2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a

-- 1. Tenants (Schools)
INSERT INTO schools (id, slug, name, domain, is_public_hub, subscription_status)
VALUES 
    -- Platform & Universal Public Hub pseudo-school
    ('00000000-0000-0000-0000-000000000000', 'public-hub', 'EduSocrates Universal Public Hub', 'public.edusocrates.org', TRUE, 'ACTIVE'),
    ('11111111-1111-4111-a111-111111111111', 'horizon-academy', 'Horizon International Academy', 'horizon.edu', FALSE, 'ACTIVE'),
    ('22222222-2222-4222-a222-222222222222', 'apex-science', 'Apex Science Institute', 'apex.edu', FALSE, 'ACTIVE')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_public_hub = EXCLUDED.is_public_hub;

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
    -- Horizon Student 2 (Child 2 for Multi-Child Demonstration)
    ('11111111-1111-4111-a111-111111110005', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'STUDENT', 'emily.chen@horizon.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Emily', 'Chen', TRUE),
    -- Horizon Parent
    ('11111111-1111-4111-a111-111111110004', '11111111-1111-4111-a111-111111111111', 'c1111111-1111-4111-a111-111111111111', 'PARENT', 'parent@horizon.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Eleanor', 'Chen', TRUE),
    -- Apex Admin (Tenant B)
    ('22222222-2222-4222-a222-222222220001', '22222222-2222-4222-a222-222222222222', 'c2222222-2222-4222-a222-222222222221', 'SCHOOL_ADMIN', 'admin@apex.edu', '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a', 'Arthur', 'Pendleton', TRUE)
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 8. Parent-Student Associations
INSERT INTO parent_student_associations (id, school_id, parent_id, student_id, relationship_type)
VALUES
    ('ea111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111110004', '11111111-1111-4111-a111-111111110003', 'MOTHER'),
    ('ea111111-1111-4111-a111-111111111112', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111110004', '11111111-1111-4111-a111-111111110005', 'MOTHER')
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


-- ============================================================================
-- 14. EduSocrates v2.3.0 Universal Public Learning Hub Seed Data
-- ============================================================================

INSERT INTO users (id, school_id, campus_id, role, email, password_hash, first_name, last_name, is_active)
VALUES (
    '00000002-0000-4000-a000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    'INDEPENDENT_STUDENT',
    'learner@public.org',
    '$2b$10$CnBEPdJSUeirnixKcXHxs.T.Ilc/7mX/iroJzALzTyFrY1nBdeL7a',
    'Samira',
    'Patel',
    TRUE
)
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
VALUES
    ('00000002-0000-4000-a000-000000000001', 4, 7, 240, '["First Spark", "Socratic Explorer"]'::jsonb),
    ('11111111-1111-4111-a111-111111110003', 6, 10, 410, '["First Spark", "Vector Thinker"]'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

UPDATE coursework
SET is_public = TRUE, access_level = 'PUBLIC_DIRECTORY'
WHERE id = 'ca111111-1111-4111-a111-111111111111';

INSERT INTO school_invites (id, school_id, campus_id, section_id, invite_code, target_role, created_by, max_uses)
VALUES (
    '9a111111-1111-4111-a111-111111111111',
    '11111111-1111-4111-a111-111111111111',
    'c1111111-1111-4111-a111-111111111111',
    'd1111111-1111-4111-a111-111111111111',
    'HORIZON-2026',
    'STUDENT',
    '11111111-1111-4111-a111-111111110001',
    500
)
ON CONFLICT (invite_code) DO NOTHING;

INSERT INTO concept_nodes (id, parent_node_id, domain_slug, title, description, socratic_checkpoint_prompt, sort_order)
VALUES
    ('c0010001-0000-4000-a000-000000000001', NULL, 'physics', '1. Scalars vs. Vectors', 'Distinguish quantities that only have magnitude (speed, mass) from quantities with both magnitude and direction (velocity, force).', 'Explain in your own words why two cars traveling at 60 km/h in perpendicular directions have the same speed but different velocities.', 1),
    ('c0010001-0000-4000-a000-000000000002', 'c0010001-0000-4000-a000-000000000001', 'physics', '2. Newton''s Laws of Motion', 'Understand inertia, F = ma, and action-reaction force pairs acting on different bodies.', 'If you push against a heavy wall and it does not move, why do the action and reaction forces NOT cancel each other out?', 2),
    ('c0010001-0000-4000-a000-000000000003', 'c0010001-0000-4000-a000-000000000002', 'physics', '3. Conservation of Momentum', 'Analyze closed-system collisions by decomposing momentum into orthogonal components.', 'Why is total linear momentum conserved in an inelastic collision even though kinetic energy is lost?', 3),
    ('c0020001-0000-4000-a000-000000000001', NULL, 'calculus', '1. Limits & Continuity', 'Evaluate function behavior as inputs approach a value from both left and right sides.', 'What makes the limit of sin(x)/x as x approaches 0 meaningful even though direct substitution gives 0/0?', 1),
    ('c0020001-0000-4000-a000-000000000002', 'c0020001-0000-4000-a000-000000000001', 'calculus', '2. Derivatives & Instantaneous Rate', 'Understand the derivative as the limit of secant slopes approaching a tangent line.', 'Geometrically, why does an instantaneous velocity correspond to the slope of a tangent line rather than a secant line?', 2),
    ('c0020001-0000-4000-a000-000000000003', 'c0020001-0000-4000-a000-000000000002', 'calculus', '3. Fundamental Theorem of Calculus', 'Connect antiderivatives (accumulation) with derivatives (rate of change).', 'How does accumulating infinitely thin rectangles relate to reversing differentiation?', 3),
    ('c0030001-0000-4000-a000-000000000001', NULL, 'cs', '1. Recursion & Base Cases', 'Break self-similar problems into a terminating base case and a smaller recursive step.', 'What happens in memory (call stack) if a recursive function modifies its input incorrectly and never reaches its base case?', 1),
    ('c0030001-0000-4000-a000-000000000002', 'c0030001-0000-4000-a000-000000000001', 'cs', '2. Time Complexity & Big-O', 'Measure how algorithm runtime grows relative to input size n.', 'Why does binary search achieve O(log n) while linear scan requires O(n) on a sorted array?', 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO socratic_flashcard_decks (id, school_id, creator_id, coursework_id, title, subject_area, is_public)
VALUES
    ('d0010001-0000-4000-a000-000000000001', '00000000-0000-0000-0000-000000000000', '00000002-0000-4000-a000-000000000001', NULL, 'Classical Mechanics Essentials', 'AP Physics 1', TRUE),
    ('d0010001-0000-4000-a000-000000000002', '11111111-1111-4111-a111-111111111111', '11111111-1111-4111-a111-111111110002', 'ca111111-1111-4111-a111-111111111111', 'Vector Momentum Study Deck', 'AP Physics 1', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO flashcards (id, deck_id, concept_title, clue_tier_1, clue_tier_2, terminal_definition)
VALUES
    ('f0010001-0000-4000-a000-000000000001', 'd0010001-0000-4000-a000-000000000001', 'Impulse-Momentum Theorem', 'Think about what happens when a net force acts over a short vs. long duration of time.', 'Relate F * dt (change over time) to m * dv.', 'Impulse J = F_net * delta_t equals the change in an object''s momentum (delta_p = m * delta_v).'),
    ('f0010001-0000-4000-a000-000000000002', 'd0010001-0000-4000-a000-000000000001', 'Elastic vs. Inelastic Collision', 'Consider whether two colliding objects bounce apart or stick together, and where thermal/sound energy goes.', 'Momentum is conserved in both, but what about mechanical kinetic energy?', 'Elastic collisions conserve both momentum and kinetic energy; completely inelastic collisions maximize KE loss as objects stick together.'),
    ('f0010001-0000-4000-a000-000000000003', 'd0010001-0000-4000-a000-000000000002', 'Orthogonal Vector Decomposition', 'Can perpendicular motion along East affect momentum along North?', 'Split total velocity into v_x = v cos(theta) and v_y = v sin(theta) before summing.', 'Independent X and Y momentum components are conserved separately: P_x = sum(m_i * v_ix), P_y = sum(m_i * v_iy), |P| = sqrt(P_x^2 + P_y^2).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO practice_quizzes (id, user_id, school_id, title, subject, difficulty_level)
VALUES (
    '91000001-0000-4000-a000-000000000001',
    '00000002-0000-4000-a000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'Newtonian Mechanics Diagnostic Check',
    'AP Physics 1',
    'HIGH_SCHOOL'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO practice_quiz_questions (id, quiz_id, question_text, options, correct_option_index, misconception_explanation)
VALUES
    (
        '92000001-0000-4000-a000-000000000001',
        '91000001-0000-4000-a000-000000000001',
        'Two ice skaters push off from each other on frictionless ice. Skater A has twice the mass of Skater B. Which statement about their momenta right after pushing off is true?',
        '["Skater A has twice the momentum magnitude of Skater B", "Both skaters have equal and opposite momentum magnitudes", "Skater B has twice the momentum magnitude of Skater A", "Total momentum doubles after they separate"]'::jsonb,
        1,
        'Because internal push forces act equally and oppositely for the same time, total system momentum stays zero — meaning m_A * v_A and m_B * v_B have equal magnitudes in opposite directions (Skater B moves twice as fast, not with more momentum).'
    ),
    (
        '92000001-0000-4000-a000-000000000002',
        '91000001-0000-4000-a000-000000000001',
        'An object moves in a circle at constant speed. What can you say about its net force?',
        '["The net force is zero because speed is constant", "The net force points tangent to the circle", "The net force points toward the center of the circle", "Gravity is the only possible net force"]'::jsonb,
        2,
        'Velocity is a vector! Even at constant speed, the direction changes continuously, requiring a centripetal acceleration and net force directed toward the center of curvature.'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO discussion_threads (id, school_id, author_id, subject_tag, title, body)
VALUES (
    '71000001-0000-4000-a000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    '00000002-0000-4000-a000-000000000001',
    'AP Physics 1',
    'Why do perpendicular momentum components never mix?',
    'When solving the 2D car-truck collision problem, why can we sum X momenta and Y momenta separately instead of adding speeds directly?'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO discussion_replies (id, thread_id, author_id, reply_body, is_ai_socratic_guide)
VALUES (
    '72000001-0000-4000-a000-000000000001',
    '71000001-0000-4000-a000-000000000001',
    NULL,
    'Great question to spark discussion! Think geometrically: if you push an object purely due North, how much does its East-West velocity change? How does Newton''s Second Law along orthogonal axes guide how you combine the final components?',
    TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO whiteboard_rooms (id, school_id, coursework_id, creator_id, title, canvas_state, is_active)
VALUES (
    '81000001-0000-4000-a000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    NULL,
    '00000002-0000-4000-a000-000000000001',
    'Open Physics & Vector Mechanics Study Room',
    '{"strokes":[],"notes":[{"id":"n1","x":40,"y":40,"text":"Remember: Split Px and Py before finding resultant angle!"}]}'::jsonb,
    TRUE
)
ON CONFLICT (id) DO NOTHING;
