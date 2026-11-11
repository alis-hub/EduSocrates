-- EduSocrates v2.3.0 Public Learning Hub Seed Data (Idempotent)
-- Password for learner@public.org is: Password123!

-- 1. Independent Student Demo Account (under Reserved Public Hub Tenant)
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

-- 2. Gamification Profiles for demo learners
INSERT INTO student_gamification_profiles (user_id, current_streak, longest_streak, total_xp, badges)
VALUES
    ('00000002-0000-4000-a000-000000000001', 4, 7, 240, '["First Spark", "Socratic Explorer"]'::jsonb),
    ('11111111-1111-4111-a111-111111110003', 6, 10, 410, '["First Spark", "Vector Thinker"]'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- 3. Sample Public Coursework Resource Bank entry
UPDATE coursework
SET is_public = TRUE, access_level = 'PUBLIC_DIRECTORY'
WHERE id = 'ca111111-1111-4111-a111-111111111111';

-- 4. Sample School Enrollment Invite Code for Independent->Enrolled Migration Testing
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

-- 5. Knowledge Map / Concept DAG Trees (Physics, Calculus, Computer Science)
INSERT INTO concept_nodes (id, parent_node_id, domain_slug, title, description, socratic_checkpoint_prompt, sort_order)
VALUES
    -- Physics Tree
    ('c0010001-0000-4000-a000-000000000001', NULL, 'physics', '1. Scalars vs. Vectors', 'Distinguish quantities that only have magnitude (speed, mass) from quantities with both magnitude and direction (velocity, force).', 'Explain in your own words why two cars traveling at 60 km/h in perpendicular directions have the same speed but different velocities.', 1),
    ('c0010001-0000-4000-a000-000000000002', 'c0010001-0000-4000-a000-000000000001', 'physics', '2. Newton''s Laws of Motion', 'Understand inertia, F = ma, and action-reaction force pairs acting on different bodies.', 'If you push against a heavy wall and it does not move, why do the action and reaction forces NOT cancel each other out?', 2),
    ('c0010001-0000-4000-a000-000000000003', 'c0010001-0000-4000-a000-000000000002', 'physics', '3. Conservation of Momentum', 'Analyze closed-system collisions by decomposing momentum into orthogonal components.', 'Why is total linear momentum conserved in an inelastic collision even though kinetic energy is lost?', 3),
    -- Calculus Tree
    ('c0020001-0000-4000-a000-000000000001', NULL, 'calculus', '1. Limits & Continuity', 'Evaluate function behavior as inputs approach a value from both left and right sides.', 'What makes the limit of sin(x)/x as x approaches 0 meaningful even though direct substitution gives 0/0?', 1),
    ('c0020001-0000-4000-a000-000000000002', 'c0020001-0000-4000-a000-000000000001', 'calculus', '2. Derivatives & Instantaneous Rate', 'Understand the derivative as the limit of secant slopes approaching a tangent line.', 'Geometrically, why does an instantaneous velocity correspond to the slope of a tangent line rather than a secant line?', 2),
    ('c0020001-0000-4000-a000-000000000003', 'c0020001-0000-4000-a000-000000000002', 'calculus', '3. Fundamental Theorem of Calculus', 'Connect antiderivatives (accumulation) with derivatives (rate of change).', 'How does accumulating infinitely thin rectangles relate to reversing differentiation?', 3),
    -- Computer Science Tree
    ('c0030001-0000-4000-a000-000000000001', NULL, 'cs', '1. Recursion & Base Cases', 'Break self-similar problems into a terminating base case and a smaller recursive step.', 'What happens in memory (call stack) if a recursive function modifies its input incorrectly and never reaches its base case?', 1),
    ('c0030001-0000-4000-a000-000000000002', 'c0030001-0000-4000-a000-000000000001', 'cs', '2. Time Complexity & Big-O', 'Measure how algorithm runtime grows relative to input size n.', 'Why does binary search achieve O(log n) while linear scan requires O(n) on a sorted array?', 2)
ON CONFLICT (id) DO NOTHING;

-- 6. Sample Socratic Flashcard Decks & Cards
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

-- 7. Sample Public Practice Quiz
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

-- 8. Sample Peer Discussion Thread & AI Guide Reply
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

-- 9. Sample Collaborative Whiteboard Room
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
