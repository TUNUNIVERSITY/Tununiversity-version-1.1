-- =====================================================
-- TEACHER SERVICE - TEST DATA POPULATION SCRIPT
-- University Platform Database
-- =====================================================

-- Clear existing data (in correct order to respect foreign keys)
DELETE FROM notifications;
DELETE FROM messages;
DELETE FROM makeup_sessions;
DELETE FROM absence_requests;
DELETE FROM absences;
DELETE FROM sessions;
DELETE FROM timetable_slots;
DELETE FROM teacher_subjects;
DELETE FROM teachers;
DELETE FROM students;
DELETE FROM users WHERE role IN ('teacher', 'student', 'admin');
DELETE FROM subjects;
DELETE FROM rooms;
DELETE FROM groups;
DELETE FROM levels;
DELETE FROM specialties;
DELETE FROM departments;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE teachers_id_seq RESTART WITH 1;
ALTER SEQUENCE students_id_seq RESTART WITH 1;
ALTER SEQUENCE departments_id_seq RESTART WITH 1;
ALTER SEQUENCE specialties_id_seq RESTART WITH 1;
ALTER SEQUENCE levels_id_seq RESTART WITH 1;
ALTER SEQUENCE groups_id_seq RESTART WITH 1;
ALTER SEQUENCE subjects_id_seq RESTART WITH 1;
ALTER SEQUENCE rooms_id_seq RESTART WITH 1;
ALTER SEQUENCE teacher_subjects_id_seq RESTART WITH 1;
ALTER SEQUENCE timetable_slots_id_seq RESTART WITH 1;
ALTER SEQUENCE sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE absences_id_seq RESTART WITH 1;
ALTER SEQUENCE absence_requests_id_seq RESTART WITH 1;
ALTER SEQUENCE makeup_sessions_id_seq RESTART WITH 1;
ALTER SEQUENCE messages_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;

-- =====================================================
-- 1. DEPARTMENTS
-- =====================================================
INSERT INTO departments (name, code, created_at, updated_at) VALUES
('Computer Science', 'CS', NOW(), NOW()),
('Software Engineering', 'SE', NOW(), NOW()),
('Information Systems', 'IS', NOW(), NOW()),
('Mathematics', 'MATH', NOW(), NOW());

-- =====================================================
-- 2. SPECIALTIES
-- =====================================================
INSERT INTO specialties (name, code, department_id, created_at, updated_at) VALUES
('Software Engineering', 'SE', 2, NOW(), NOW()),
('Artificial Intelligence', 'AI', 1, NOW(), NOW()),
('Cybersecurity', 'CS', 1, NOW(), NOW()),
('Data Science', 'DS', 1, NOW(), NOW());

-- =====================================================
-- 3. LEVELS (Year levels for each specialty)
-- =====================================================
-- Software Engineering Levels
INSERT INTO levels (name, code, specialty_id, year_number, created_at, updated_at) VALUES
('SE First Year', 'SE-L1', 1, 1, NOW(), NOW()),
('SE Second Year', 'SE-L2', 1, 2, NOW(), NOW()),
('SE Third Year', 'SE-L3', 1, 3, NOW(), NOW()),
-- AI Levels
('AI First Year', 'AI-L1', 2, 1, NOW(), NOW()),
('AI Second Year', 'AI-L2', 2, 2, NOW(), NOW()),
-- Cybersecurity Levels  
('CS First Year', 'CS-L1', 3, 1, NOW(), NOW()),
('CS Second Year', 'CS-L2', 3, 2, NOW(), NOW());

-- =====================================================
-- 4. GROUPS
-- =====================================================
INSERT INTO groups (name, code, level_id, max_students, created_at, updated_at) VALUES
('G1-SE-2025', 'G1SE25', 1, 30, NOW(), NOW()),
('G2-SE-2025', 'G2SE25', 1, 30, NOW(), NOW()),
('G1-AI-2025', 'G1AI25', 2, 25, NOW(), NOW()),
('G1-CS-2025', 'G1CS25', 2, 25, NOW(), NOW());

-- =====================================================
-- 5. USERS (Admin, Teachers, Students)
-- =====================================================

-- Admin Users
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, cin, created_at, updated_at) VALUES
('admin@university.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Alice', 'Admin', 'admin', true, 'AD123456', NOW(), NOW());

-- Teacher Users
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, cin, created_at, updated_at) VALUES
('ahmed.missaoui@university.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Ahmed', 'Missaoui', 'teacher', true, 'TC001122', NOW(), NOW()),
('mark.taylor@university.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Mark', 'Taylor', 'teacher', true, 'TC002233', NOW(), NOW()),
('sara.jones@university.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Sara', 'Jones', 'teacher', true, 'TC003344', NOW(), NOW()),
('mohamed.ben@university.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Mohamed', 'Ben Ali', 'teacher', true, 'TC004455', NOW(), NOW()),
('linda.smith@university.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Linda', 'Smith', 'teacher', true, 'TC005566', NOW(), NOW());

-- Student Users (10 students for G1-SE-2025)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, cin, created_at, updated_at) VALUES
('john.doe@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'John', 'Doe', 'student', true, 'ST001001', NOW(), NOW()),
('jane.smith@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Jane', 'Smith', 'student', true, 'ST001002', NOW(), NOW()),
('ali.hassan@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Ali', 'Hassan', 'student', true, 'ST001003', NOW(), NOW()),
('fatima.zahra@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Fatima', 'Zahra', 'student', true, 'ST001004', NOW(), NOW()),
('mike.johnson@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Mike', 'Johnson', 'student', true, 'ST001005', NOW(), NOW()),
('sarah.williams@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Sarah', 'Williams', 'student', true, 'ST001006', NOW(), NOW()),
('omar.khalil@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Omar', 'Khalil', 'student', true, 'ST001007', NOW(), NOW()),
('layla.ahmed@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Layla', 'Ahmed', 'student', true, 'ST001008', NOW(), NOW()),
('david.brown@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'David', 'Brown', 'student', true, 'ST001009', NOW(), NOW()),
('emma.davis@student.edu', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'Emma', 'Davis', 'student', true, 'ST001010', NOW(), NOW());

-- =====================================================
-- 6. TEACHERS
-- =====================================================
INSERT INTO teachers (user_id, employee_id, department_id, specialization, phone, hire_date, created_at, updated_at)
SELECT 
    u.id, 
    'EMP' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::TEXT, 4, '0'),
    CASE 
        WHEN u.last_name = 'Missaoui' THEN 2
        WHEN u.last_name = 'Taylor' THEN 1
        WHEN u.last_name = 'Jones' THEN 2
        WHEN u.last_name IN ('Ben Ali', 'Smith') THEN 3
    END,
    CASE 
        WHEN u.last_name = 'Missaoui' THEN 'Database Systems'
        WHEN u.last_name = 'Taylor' THEN 'Algorithms & Data Structures'
        WHEN u.last_name = 'Jones' THEN 'Web Development'
        WHEN u.last_name = 'Ben Ali' THEN 'Network Security'
        WHEN u.last_name = 'Smith' THEN 'Machine Learning'
    END,
    CASE 
        WHEN u.last_name = 'Missaoui' THEN '+216 20 123 456'
        WHEN u.last_name = 'Taylor' THEN '+1 555 0101'
        WHEN u.last_name = 'Jones' THEN '+1 555 0202'
        WHEN u.last_name = 'Ben Ali' THEN '+216 98 765 432'
        WHEN u.last_name = 'Smith' THEN '+1 555 0303'
    END,
    DATE '2020-09-01',
    NOW(),
    NOW()
FROM users u
WHERE u.role = 'teacher';

-- =====================================================
-- 7. STUDENTS
-- =====================================================
INSERT INTO students (user_id, student_number, group_id, specialty_id, enrollment_date, date_of_birth, phone, address, created_at, updated_at)
SELECT 
    u.id,
    'SE2025' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::TEXT, 4, '0'),
    1, -- G1-SE-2025
    1, -- Software Engineering
    DATE '2025-09-01',
    DATE '2005-01-01' + (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY u.id) * 30)),
    '+216 ' || (90000000 + ROW_NUMBER() OVER (ORDER BY u.id))::TEXT,
    'Address ' || ROW_NUMBER() OVER (ORDER BY u.id) || ', Tunis',
    NOW(),
    NOW()
FROM users u
WHERE u.role = 'student'
LIMIT 10;

-- =====================================================
-- 8. SUBJECTS
-- =====================================================
INSERT INTO subjects (name, code, credits, semester, created_at, updated_at) VALUES
('Database Management Systems', 'CS301', 6, 1, NOW(), NOW()),
('Algorithms and Data Structures', 'CS201', 6, 1, NOW(), NOW()),
('Web Development', 'SE202', 5, 1, NOW(), NOW()),
('Network Security', 'CS401', 5, 2, NOW(), NOW()),
('Machine Learning', 'AI301', 6, 2, NOW(), NOW()),
('Software Engineering', 'SE301', 6, 1, NOW(), NOW()),
('Operating Systems', 'CS302', 6, 1, NOW(), NOW());

-- =====================================================
-- 9. ROOMS
-- =====================================================
INSERT INTO rooms (name, building, capacity, room_type, created_at, updated_at) VALUES
('A101', 'Building A', 30, 'lecture', NOW(), NOW()),
('A102', 'Building A', 30, 'lecture', NOW(), NOW()),
('B201', 'Building B', 25, 'lab', NOW(), NOW()),
('B202', 'Building B', 25, 'lab', NOW(), NOW()),
('C301', 'Building C', 40, 'amphitheater', NOW(), NOW()),
('A103', 'Building A', 20, 'tutorial', NOW(), NOW());

-- =====================================================
-- 10. TEACHER_SUBJECTS (Who teaches what to which group)
-- =====================================================
INSERT INTO teacher_subjects (teacher_id, subject_id, group_id, academic_year, semester, created_at, updated_at)
SELECT 
    (SELECT id FROM teachers WHERE employee_id = 'EMP0002'), -- Mark Taylor
    (SELECT id FROM subjects WHERE code = 'CS201'), -- Algorithms
    1, -- G1-SE-2025
    '2025/2026',
    1,
    NOW(),
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM teachers WHERE employee_id = 'EMP0001'), -- Ahmed Missaoui
    (SELECT id FROM subjects WHERE code = 'CS301'), -- Databases
    1,
    '2025/2026',
    1,
    NOW(),
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM teachers WHERE employee_id = 'EMP0003'), -- Sara Jones
    (SELECT id FROM subjects WHERE code = 'SE202'), -- Web Dev
    1,
    '2025/2026',
    1,
    NOW(),
    NOW()
UNION ALL
SELECT 
    (SELECT id FROM teachers WHERE employee_id = 'EMP0004'), -- Mohamed Ben Ali
    (SELECT id FROM subjects WHERE code = 'CS401'), -- Network Security
    1,
    '2025/2026',
    2,
    NOW(),
    NOW();

-- =====================================================
-- 11. TIMETABLE_SLOTS (Weekly schedule)
-- =====================================================

-- Ahmed Missaoui - Databases - Monday 08:00-10:00
INSERT INTO timetable_slots (subject_id, teacher_id, group_id, room_id, day_of_week, start_time, end_time, academic_year, semester, is_active, created_at, updated_at)
VALUES 
    ((SELECT id FROM subjects WHERE code = 'CS301'),
     (SELECT id FROM teachers WHERE employee_id = 'EMP0001'),
     1,
     1, -- Room A101
     1, -- Monday
     '08:00',
     '10:00',
     '2025/2026',
     1,
     true,
     NOW(),
     NOW());

-- Mark Taylor - Algorithms - Monday 10:30-12:30
INSERT INTO timetable_slots (subject_id, teacher_id, group_id, room_id, day_of_week, start_time, end_time, academic_year, semester, is_active, created_at, updated_at)
VALUES 
    ((SELECT id FROM subjects WHERE code = 'CS201'),
     (SELECT id FROM teachers WHERE employee_id = 'EMP0002'),
     1,
     2, -- Room A102
     1, -- Monday
     '10:30',
     '12:30',
     '2025/2026',
     1,
     true,
     NOW(),
     NOW());

-- Sara Jones - Web Dev - Tuesday 14:00-16:00
INSERT INTO timetable_slots (subject_id, teacher_id, group_id, room_id, day_of_week, start_time, end_time, academic_year, semester, is_active, created_at, updated_at)
VALUES 
    ((SELECT id FROM subjects WHERE code = 'SE202'),
     (SELECT id FROM teachers WHERE employee_id = 'EMP0003'),
     1,
     3, -- Room B201 (Lab)
     2, -- Tuesday
     '14:00',
     '16:00',
     '2025/2026',
     1,
     true,
     NOW(),
     NOW());

-- Ahmed Missaoui - Databases - Wednesday 08:00-10:00
INSERT INTO timetable_slots (subject_id, teacher_id, group_id, room_id, day_of_week, start_time, end_time, academic_year, semester, is_active, created_at, updated_at)
VALUES 
    ((SELECT id FROM subjects WHERE code = 'CS301'),
     (SELECT id FROM teachers WHERE employee_id = 'EMP0001'),
     1,
     1,
     3, -- Wednesday
     '08:00',
     '10:00',
     '2025/2026',
     1,
     true,
     NOW(),
     NOW());

-- Mark Taylor - Algorithms - Thursday 10:30-12:30
INSERT INTO timetable_slots (subject_id, teacher_id, group_id, room_id, day_of_week, start_time, end_time, academic_year, semester, is_active, created_at, updated_at)
VALUES 
    ((SELECT id FROM subjects WHERE code = 'CS201'),
     (SELECT id FROM teachers WHERE employee_id = 'EMP0002'),
     1,
     2,
     4, -- Thursday
     '10:30',
     '12:30',
     '2025/2026',
     1,
     true,
     NOW(),
     NOW());

-- =====================================================
-- 12. SESSIONS (Actual class sessions with dates)
-- =====================================================

-- Create sessions for the past 2 weeks and next week
DO $$
DECLARE
    slot_record RECORD;
    session_date DATE;
    week_offset INT;
BEGIN
    -- For each timetable slot
    FOR slot_record IN 
        SELECT id, day_of_week, start_time, end_time, room_id
        FROM timetable_slots
        WHERE is_active = true
    LOOP
        -- Generate sessions for weeks: -2, -1, 0 (current), +1
        FOR week_offset IN -2..1 LOOP
            -- Calculate the date for this week's session
            session_date := CURRENT_DATE + ((week_offset * 7) + (slot_record.day_of_week - EXTRACT(DOW FROM CURRENT_DATE)::INT))::INT;
            
            -- Only insert if the date is not in the future beyond next week
            IF session_date <= CURRENT_DATE + INTERVAL '7 days' THEN
                INSERT INTO sessions (
                    timetable_slot_id, 
                    session_date, 
                    start_time, 
                    end_time, 
                    room_id, 
                    status, 
                    is_makeup,
                    created_at, 
                    updated_at
                ) VALUES (
                    slot_record.id,
                    session_date,
                    slot_record.start_time::TIME,
                    slot_record.end_time::TIME,
                    slot_record.room_id,
                    CASE 
                        WHEN session_date < CURRENT_DATE THEN 'completed'
                        WHEN session_date = CURRENT_DATE THEN 'in_progress'
                        ELSE 'scheduled'
                    END,
                    false,
                    NOW(),
                    NOW()
                );
            END IF;
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 13. ABSENCES (Some students were absent in past sessions)
-- =====================================================

-- Mark some students as absent in past sessions (realistic pattern)
INSERT INTO absences (student_id, session_id, absence_type, marked_at, marked_by, reason, created_at, updated_at)
SELECT 
    st.id,
    sess.id,
    'unjustified',
    sess.session_date + TIME '09:00:00',
    ts.teacher_id,
    NULL,
    NOW(),
    NOW()
FROM sessions sess
INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
CROSS JOIN students st
WHERE sess.status = 'completed'
    AND sess.session_date < CURRENT_DATE - INTERVAL '1 day'
    AND st.group_id = 1
    -- Randomly mark about 20% of students as absent
    AND (st.id + sess.id) % 5 = 0
LIMIT 15;

-- =====================================================
-- 14. ABSENCE_REQUESTS (Students requesting to justify absences)
-- =====================================================

-- Create absence requests for some of the absences
INSERT INTO absence_requests (absence_id, student_id, request_reason, supporting_document, status, created_at, updated_at)
SELECT 
    a.id,
    a.student_id,
    CASE (a.id % 3)
        WHEN 0 THEN 'Medical appointment - had doctor visit'
        WHEN 1 THEN 'Family emergency - urgent family matter'
        WHEN 2 THEN 'Illness - was sick with flu'
    END,
    CASE (a.id % 2)
        WHEN 0 THEN 'medical_certificate_' || a.id || '.pdf'
        ELSE NULL
    END,
    CASE 
        WHEN a.id % 3 = 0 THEN 'pending'
        WHEN a.id % 3 = 1 THEN 'approved'
        ELSE 'rejected'
    END,
    NOW() - INTERVAL '1 day',
    NOW()
FROM absences a
WHERE a.id <= 10
LIMIT 8;

-- Update reviewed absence requests
UPDATE absence_requests
SET reviewed_by = (SELECT id FROM teachers WHERE employee_id = 'EMP0001'),
    reviewed_at = NOW() - INTERVAL '6 hours',
    review_comment = CASE 
        WHEN status = 'approved' THEN 'Approved - valid medical reason'
        WHEN status = 'rejected' THEN 'Rejected - insufficient documentation'
        ELSE NULL
    END
WHERE status IN ('approved', 'rejected');

-- Update absence types for approved requests
UPDATE absences a
SET absence_type = 'justified'
FROM absence_requests ar
WHERE ar.absence_id = a.id
    AND ar.status = 'approved';

-- =====================================================
-- 15. MAKEUP_SESSIONS (Make-up classes scheduled)
-- =====================================================

-- Create a makeup session for next week
INSERT INTO makeup_sessions (
    original_session_id,
    teacher_id,
    subject_id,
    group_id,
    room_id,
    session_date,
    start_time,
    end_time,
    reason,
    status,
    created_at,
    updated_at
)
SELECT 
    sess.id,
    ts.teacher_id,
    ts.subject_id,
    ts.group_id,
    sess.room_id,
    CURRENT_DATE + INTERVAL '5 days',
    '16:00:00'::TIME,
    '18:00:00'::TIME,
    'Make-up for missed session due to teacher absence',
    'scheduled',
    NOW(),
    NOW()
FROM sessions sess
INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
WHERE sess.status = 'completed'
LIMIT 2;

-- =====================================================
-- 16. MESSAGES (Communication between teachers, students, admin)
-- =====================================================

-- Admin sends welcome message to teacher
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, parent_message_id, created_at, read_at)
VALUES 
    (1, -- Admin
     2, -- Ahmed Missaoui
     'Welcome to the University Platform',
     'Dear Prof. Missaoui,

Welcome to our university teaching platform! You can now manage your classes, track student attendance, and communicate with students.

If you need any assistance, please don''t hesitate to reach out.

Best regards,
University Administration',
     true,
     NULL,
     NOW() - INTERVAL '10 days',
     NOW() - INTERVAL '9 days');

-- Teacher replies to admin
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, parent_message_id, created_at, read_at)
VALUES 
    (2, -- Ahmed Missaoui
     1, -- Admin
     'Re: Welcome to the University Platform',
     'Thank you for the welcome message. The platform looks great and very user-friendly.

I have started using it for my Database course and it''s working perfectly.

Best regards,
Prof. Ahmed Missaoui',
     true,
     1,
     NOW() - INTERVAL '9 days',
     NOW() - INTERVAL '8 days');

-- Teacher sends message to student
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, parent_message_id, created_at, read_at)
VALUES 
    (2, -- Ahmed Missaoui
     7, -- John Doe
     'Regarding Your Recent Absences',
     'Dear John,

I noticed you were absent from the last two database classes. Please make sure to catch up on the material we covered, especially the SQL joins chapter.

If you have any questions or need clarification, please feel free to reach out during office hours.

Best regards,
Prof. Missaoui',
     false,
     NULL,
     NOW() - INTERVAL '2 days',
     NULL);

-- Student sends message to teacher
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, parent_message_id, created_at, read_at)
VALUES 
    (8, -- Jane Smith
     2, -- Ahmed Missaoui
     'Question about Database Project',
     'Dear Professor,

I have a question regarding the database project deadline. Would it be possible to get a 2-day extension due to my current workload from other courses?

Thank you for your understanding.

Best regards,
Jane Smith',
     true,
     NULL,
     NOW() - INTERVAL '1 day',
     NOW() - INTERVAL '18 hours');

-- Teacher sends message to another teacher
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, parent_message_id, created_at, read_at)
VALUES 
    (2, -- Ahmed Missaoui
     3, -- Mark Taylor
     'Collaboration on Joint Project',
     'Hi Mark,

I was thinking about creating a joint project between our Database and Algorithms courses. Students could design and implement a database with optimized queries.

Let me know if you''re interested!

Best,
Ahmed',
     false,
     NULL,
     NOW() - INTERVAL '3 hours',
     NULL);

-- Unread message from admin
INSERT INTO messages (sender_id, recipient_id, subject, content, is_read, parent_message_id, created_at, read_at)
VALUES 
    (1, -- Admin
     2, -- Ahmed Missaoui
     'Important: Faculty Meeting Next Week',
     'Dear Faculty Members,

This is to remind you about the important faculty meeting scheduled for next Wednesday at 2:00 PM in Room C301.

Agenda:
- Curriculum review
- Student performance analysis
- New teaching tools

Your attendance is required.

Best regards,
Administration',
     false,
     NULL,
     NOW() - INTERVAL '1 hour',
     NULL);

-- =====================================================
-- 17. NOTIFICATIONS
-- =====================================================

-- Absence request notifications
INSERT INTO notifications (user_id, title, message, notification_type, is_read, related_entity_type, related_entity_id, created_at)
SELECT 
    ts.teacher_id,
    'New Absence Request',
    'Student ' || u.first_name || ' ' || u.last_name || ' has submitted an absence request for your ' || subj.name || ' class',
    'absence',
    CASE WHEN ar.status = 'pending' THEN false ELSE true END,
    'absence_request',
    ar.id,
    ar.created_at
FROM absence_requests ar
INNER JOIN absences a ON ar.absence_id = a.id
INNER JOIN students st ON ar.student_id = st.id
INNER JOIN users u ON st.user_id = u.id
INNER JOIN sessions sess ON a.session_id = sess.id
INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
INNER JOIN subjects subj ON ts.subject_id = subj.id
WHERE ar.status = 'pending';

-- General notifications for teachers
INSERT INTO notifications (user_id, title, message, notification_type, is_read, related_entity_type, related_entity_id, created_at)
SELECT 
    t.user_id,
    'Welcome to Teacher Portal',
    'Welcome! You can now manage your classes, track attendance, and communicate with students.',
    'general',
    true,
    NULL,
    NULL,
    NOW() - INTERVAL '10 days'
FROM teachers t;

-- Timetable notification
INSERT INTO notifications (user_id, title, message, notification_type, is_read, related_entity_type, related_entity_id, created_at)
VALUES 
    (2, -- Ahmed Missaoui
     'Class Reminder',
     'You have a Database class today at 08:00 in Room A101',
     'timetable',
     false,
     'session',
     (SELECT id FROM sessions WHERE status = 'scheduled' LIMIT 1),
     NOW() - INTERVAL '1 hour');

-- Alert notification
INSERT INTO notifications (user_id, title, message, notification_type, is_read, related_entity_type, related_entity_id, created_at)
VALUES 
    (2, -- Ahmed Missaoui
     'High Absence Rate Alert',
     'Warning: Group G1-SE-2025 has a high absence rate (25%) in your Database course',
     'alert',
     false,
     NULL,
     NULL,
     NOW() - INTERVAL '2 hours');

-- =====================================================
-- SUMMARY REPORT
-- =====================================================

-- Display summary of inserted data
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE 'TEST DATA POPULATION COMPLETE!';
    RAISE NOTICE '================================================';
    RAISE NOTICE 'Users: % total', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '  - Admins: %', (SELECT COUNT(*) FROM users WHERE role = 'admin');
    RAISE NOTICE '  - Teachers: %', (SELECT COUNT(*) FROM users WHERE role = 'teacher');
    RAISE NOTICE '  - Students: %', (SELECT COUNT(*) FROM users WHERE role = 'student');
    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE 'Teachers: %', (SELECT COUNT(*) FROM teachers);
    RAISE NOTICE 'Students: %', (SELECT COUNT(*) FROM students);
    RAISE NOTICE 'Departments: %', (SELECT COUNT(*) FROM departments);
    RAISE NOTICE 'Subjects: %', (SELECT COUNT(*) FROM subjects);
    RAISE NOTICE 'Groups: %', (SELECT COUNT(*) FROM groups);
    RAISE NOTICE 'Rooms: %', (SELECT COUNT(*) FROM rooms);
    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE 'Timetable Slots: %', (SELECT COUNT(*) FROM timetable_slots);
    RAISE NOTICE 'Sessions: %', (SELECT COUNT(*) FROM sessions);
    RAISE NOTICE '  - Completed: %', (SELECT COUNT(*) FROM sessions WHERE status = 'completed');
    RAISE NOTICE '  - Scheduled: %', (SELECT COUNT(*) FROM sessions WHERE status = 'scheduled');
    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE 'Absences: %', (SELECT COUNT(*) FROM absences);
    RAISE NOTICE '  - Justified: %', (SELECT COUNT(*) FROM absences WHERE absence_type = 'justified');
    RAISE NOTICE '  - Unjustified: %', (SELECT COUNT(*) FROM absences WHERE absence_type = 'unjustified');
    RAISE NOTICE 'Absence Requests: %', (SELECT COUNT(*) FROM absence_requests);
    RAISE NOTICE '  - Pending: %', (SELECT COUNT(*) FROM absence_requests WHERE status = 'pending');
    RAISE NOTICE '  - Approved: %', (SELECT COUNT(*) FROM absence_requests WHERE status = 'approved');
    RAISE NOTICE '  - Rejected: %', (SELECT COUNT(*) FROM absence_requests WHERE status = 'rejected');
    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE 'Makeup Sessions: %', (SELECT COUNT(*) FROM makeup_sessions);
    RAISE NOTICE 'Messages: %', (SELECT COUNT(*) FROM messages);
    RAISE NOTICE 'Notifications: %', (SELECT COUNT(*) FROM notifications);
    RAISE NOTICE '================================================';
    RAISE NOTICE 'READY TO TEST!';
    RAISE NOTICE 'Teacher Login: ahmed.missaoui@university.edu';
    RAISE NOTICE 'Teacher ID: 1';
    RAISE NOTICE '================================================';
END $$;
