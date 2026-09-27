-- ============================================================================
-- SCRUM 6B: E-Outpass Management System
-- Normalized Scalable Seed Dataset
-- 6 Hostels (3 Boys, 3 Girls), 6 Wardens, 2 Gate Securities, 18 Students
-- Gender-Segregated Gates: SEC-BOYS (Boys Gate), SEC-GIRLS (Girls Gate)
-- ============================================================================

-- Clean existing records in dependency order
TRUNCATE TABLE outpass_status_history CASCADE;
TRUNCATE TABLE outpass_requests CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE securities CASCADE;
TRUNCATE TABLE wardens CASCADE;
TRUNCATE TABLE hostels CASCADE;

-- 1. Insert Master Hostels (3 Boys Hostels, 3 Girls Hostels)
INSERT INTO hostels (id, name, code, gender, capacity) VALUES
('HOSTEL-MAR', 'Marutham (Boys Hostel)', 'MAR', 'BOYS', 500),
('HOSTEL-KUR', 'Kurunji (Boys Hostel)',  'KUR', 'BOYS', 500),
('HOSTEL-BHA', 'Bhavani (Boys Hostel)',  'BHA', 'BOYS', 500),
('HOSTEL-CAU', 'Cauvery (Girls Hostel)', 'CAU', 'GIRLS', 600),
('HOSTEL-PON', 'Ponni (Girls Hostel)',   'PON', 'GIRLS', 600),
('HOSTEL-VAI', 'Vaigai (Girls Hostel)',   'VAI', 'GIRLS', 600)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    gender = EXCLUDED.gender,
    capacity = EXCLUDED.capacity;

-- 2. Insert Master Wardens
INSERT INTO wardens (id, name, email, phone, hostel_id) VALUES
('WARDEN-MAR', 'Dr. R. Sundaram',  'warden.marutham@college.edu', '+91 94432 00001', 'HOSTEL-MAR'),
('WARDEN-KUR', 'Dr. K. Arumugam',  'warden.kurunji@college.edu',  '+91 94432 00002', 'HOSTEL-KUR'),
('WARDEN-BHA', 'Dr. M. Selvam',    'warden.bhavani@college.edu',  '+91 94432 00003', 'HOSTEL-BHA'),
('WARDEN-CAU', 'Dr. S. Meenakshi', 'warden.cauvery@college.edu',  '+91 94432 00004', 'HOSTEL-CAU'),
('WARDEN-PON', 'Dr. P. Lakshmi',   'warden.ponni@college.edu',    '+91 94432 00005', 'HOSTEL-PON'),
('WARDEN-VAI', 'Dr. V. Revathi',   'warden.vaigai@college.edu',   '+91 94432 00006', 'HOSTEL-VAI')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    hostel_id = EXCLUDED.hostel_id;

-- Link Wardens back to Hostels
UPDATE hostels SET warden_id = 'WARDEN-MAR' WHERE id = 'HOSTEL-MAR';
UPDATE hostels SET warden_id = 'WARDEN-KUR' WHERE id = 'HOSTEL-KUR';
UPDATE hostels SET warden_id = 'WARDEN-BHA' WHERE id = 'HOSTEL-BHA';
UPDATE hostels SET warden_id = 'WARDEN-CAU' WHERE id = 'HOSTEL-CAU';
UPDATE hostels SET warden_id = 'WARDEN-PON' WHERE id = 'HOSTEL-PON';
UPDATE hostels SET warden_id = 'WARDEN-VAI' WHERE id = 'HOSTEL-VAI';

-- 3. Insert Gate Securities with Strict Allowed Gender Policy
INSERT INTO securities (id, name, email, phone, gate_name, allowed_gender) VALUES
('SEC-BOYS',  'Officer K. Raman', 'security.boys@college.edu',  '+91 94432 00007', 'Boys Hostel Gate',  'BOYS'),
('SEC-GIRLS', 'Officer M. Valli', 'security.girls@college.edu', '+91 94432 00008', 'Girls Hostel Gate', 'GIRLS')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    gate_name = EXCLUDED.gate_name,
    allowed_gender = EXCLUDED.allowed_gender;

-- 4. Insert Normalized Students Linked to Hostels via Foreign Key (hostel_id)
INSERT INTO students (id, name, email, gender, department, year, hostel_id, room_number, phone, parent_name, parent_phone, warden_id) VALUES
-- Marutham (Boys Hostel)
('2024506057', 'Keertheswar S',   'keertheswar@student.college.edu', 'BOYS', 'Information Technology', '3rd Year', 'HOSTEL-MAR', 'M-304', '+91 98765 43210', 'Senthil Nathan',   '+91 94432 10987', 'WARDEN-MAR'),
('2023506001', 'Arvind Kumar R',  'arvind.it@student.college.edu',   'BOYS', 'Information Technology', '4th Year', 'HOSTEL-MAR', 'M-118', '+91 91234 56780', 'R. Radhakrishnan', '+91 93456 78901', 'WARDEN-MAR'),
('2024501045', 'Karthik Raja P',  'karthik.cs@student.college.edu',  'BOYS', 'Computer Science',        '3rd Year', 'HOSTEL-MAR', 'M-201', '+91 98401 23456', 'P. Perumal',       '+91 94441 23456', 'WARDEN-MAR'),

-- Kurunji (Boys Hostel)
('2023503034', 'Mohammed Faizal', 'faizal.me@student.college.edu',   'BOYS', 'Mechanical Engineering',  '4th Year', 'HOSTEL-KUR', 'K-204', '+91 96551 23478', 'A. Abdul Faizal',  '+91 99441 23890', 'WARDEN-KUR'),
('2023504062', 'Sanjay V',        'sanjay.ee@student.college.edu',   'BOYS', 'Electrical Engineering',  '4th Year', 'HOSTEL-KUR', 'K-312', '+91 99440 98765', 'V. Velmurugan',    '+91 98411 77889', 'WARDEN-KUR'),
('2024506012', 'Vigneshwaran K',  'vignesh.it@student.college.edu',  'BOYS', 'Information Technology', '3rd Year', 'HOSTEL-KUR', 'K-109', '+91 98840 12345', 'K. Kannan',        '+91 97891 23456', 'WARDEN-KUR'),

-- Bhavani (Boys Hostel)
('2022502088', 'Saravanan T',     'saravanan.ec@student.college.edu','BOYS', 'Electronics & Communication', '4th Year', 'HOSTEL-BHA', 'B-101', '+91 97890 22334', 'T. Thangavel',    '+91 98422 11223', 'WARDEN-BHA'),
('2023501077', 'Dinesh Babu R',   'dinesh.cs@student.college.edu',   'BOYS', 'Computer Science',        '4th Year', 'HOSTEL-BHA', 'B-215', '+91 98412 33445', 'R. Rajendran',     '+91 94440 66778', 'WARDEN-BHA'),
('2024503023', 'Praveen Kumar M', 'praveen.me@student.college.edu',  'BOYS', 'Mechanical Engineering',  '3rd Year', 'HOSTEL-BHA', 'B-305', '+91 94451 99887', 'M. Murugesan',     '+91 97877 88990', 'WARDEN-BHA'),

-- Cauvery (Girls Hostel)
('2023501142', 'Priya Dharshini M','priya.cs@student.college.edu',   'GIRLS', 'Computer Science',       '4th Year', 'HOSTEL-CAU', 'C-214', '+91 97890 12345', 'Meenakshi Sundaram','+91 94876 54321', 'WARDEN-CAU'),
('2023505015', 'Sneha Nair',       'sneha.ai@student.college.edu',    'GIRLS', 'AI & Data Science',       '4th Year', 'HOSTEL-CAU', 'C-108', '+91 98945 61234', 'S. Nair',           '+91 97861 23456', 'WARDEN-CAU'),
('2022506115', 'Deepa Lakshmi V',  'deepa.it@student.college.edu',    'GIRLS', 'Information Technology', '4th Year', 'HOSTEL-CAU', 'C-305', '+91 98421 98765', 'V. Vijayakumar',   '+91 94435 67890', 'WARDEN-CAU'),

-- Ponni (Girls Hostel)
('2023507028', 'Ananya Ramesh',    'ananya.bt@student.college.edu',   'GIRLS', 'Biotechnology',          '4th Year', 'HOSTEL-PON', 'P-115', '+91 97900 11223', 'K. Ramesh',         '+91 98840 55667', 'WARDEN-PON'),
('2024502071', 'Kavitha S',        'kavitha.ec@student.college.edu',  'GIRLS', 'Electronics & Communication', '3rd Year', 'HOSTEL-PON', 'P-202', '+91 94455 66778', 'S. Shanmugam',     '+91 98402 33445', 'WARDEN-PON'),
('2023506045', 'Harini Devi K',    'harini.it@student.college.edu',   'GIRLS', 'Information Technology', '4th Year', 'HOSTEL-PON', 'P-310', '+91 96001 22334', 'K. Krishnamurthy', '+91 97911 44556', 'WARDEN-PON'),

-- Vaigai (Girls Hostel)
('2022501033', 'Divya Bharathi R', 'divya.cs@student.college.edu',    'GIRLS', 'Computer Science',       '4th Year', 'HOSTEL-VAI', 'V-102', '+91 98402 77889', 'R. Ramasamy',       '+91 94431 88990', 'WARDEN-VAI'),
('2023502056', 'Nandhini M',       'nandhini.ec@student.college.edu', 'GIRLS', 'Electronics & Communication', '4th Year', 'HOSTEL-VAI', 'V-218', '+91 94420 55667', 'M. Manickam',      '+91 98425 11223', 'WARDEN-VAI'),
('2024505090', 'Archana S',        'archana.ai@student.college.edu',  'GIRLS', 'AI & Data Science',       '3rd Year', 'HOSTEL-VAI', 'V-307', '+91 98845 33221', 'S. Swaminathan',    '+91 97899 33445', 'WARDEN-VAI')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    gender = EXCLUDED.gender,
    department = EXCLUDED.department,
    year = EXCLUDED.year,
    hostel_id = EXCLUDED.hostel_id,
    room_number = EXCLUDED.room_number,
    phone = EXCLUDED.phone,
    parent_name = EXCLUDED.parent_name,
    parent_phone = EXCLUDED.parent_phone,
    warden_id = EXCLUDED.warden_id;

-- 5. Insert Exactly 26 System Users into central authentication table
INSERT INTO users (id, name, email, password, role, hostel_block, hostel_id, phone, warden_id, gender) VALUES
-- 6 Wardens
('WARDEN-MAR', 'Dr. R. Sundaram',  'warden.marutham@college.edu', 'warden123', 'WARDEN', 'Marutham (Boys Hostel)', 'HOSTEL-MAR', '+91 94432 00001', NULL, 'BOYS'),
('WARDEN-KUR', 'Dr. K. Arumugam',  'warden.kurunji@college.edu',  'warden123', 'WARDEN', 'Kurunji (Boys Hostel)',  'HOSTEL-KUR', '+91 94432 00002', NULL, 'BOYS'),
('WARDEN-BHA', 'Dr. M. Selvam',    'warden.bhavani@college.edu',  'warden123', 'WARDEN', 'Bhavani (Boys Hostel)',  'HOSTEL-BHA', '+91 94432 00003', NULL, 'BOYS'),
('WARDEN-CAU', 'Dr. S. Meenakshi', 'warden.cauvery@college.edu',  'warden123', 'WARDEN', 'Cauvery (Girls Hostel)', 'HOSTEL-CAU', '+91 94432 00004', NULL, 'GIRLS'),
('WARDEN-PON', 'Dr. P. Lakshmi',   'warden.ponni@college.edu',    'warden123', 'WARDEN', 'Ponni (Girls Hostel)',   'HOSTEL-PON', '+91 94432 00005', NULL, 'GIRLS'),
('WARDEN-VAI', 'Dr. V. Revathi',   'warden.vaigai@college.edu',   'warden123', 'WARDEN', 'Vaigai (Girls Hostel)',   'HOSTEL-VAI', '+91 94432 00006', NULL, 'GIRLS'),

-- 2 Gate Securities
('SEC-BOYS',  'Officer K. Raman', 'security.boys@college.edu',  'gate123', 'SECURITY', 'Boys Hostel Gate',  'HOSTEL-MAR', '+91 94432 00007', NULL, 'BOYS'),
('SEC-GIRLS', 'Officer M. Valli', 'security.girls@college.edu', 'gate123', 'SECURITY', 'Girls Hostel Gate', 'HOSTEL-CAU', '+91 94432 00008', NULL, 'GIRLS'),

-- 18 Students
('2024506057', 'Keertheswar S',   'keertheswar@student.college.edu', 'student123', 'STUDENT', 'Marutham (Boys Hostel)', 'HOSTEL-MAR', '+91 98765 43210', 'WARDEN-MAR', 'BOYS'),
('2023506001', 'Arvind Kumar R',  'arvind.it@student.college.edu',   'student123', 'STUDENT', 'Marutham (Boys Hostel)', 'HOSTEL-MAR', '+91 91234 56780', 'WARDEN-MAR', 'BOYS'),
('2024501045', 'Karthik Raja P',  'karthik.cs@student.college.edu',  'student123', 'STUDENT', 'Marutham (Boys Hostel)', 'HOSTEL-MAR', '+91 98401 23456', 'WARDEN-MAR', 'BOYS'),

('2023503034', 'Mohammed Faizal', 'faizal.me@student.college.edu',   'student123', 'STUDENT', 'Kurunji (Boys Hostel)',  'HOSTEL-KUR', '+91 96551 23478', 'WARDEN-KUR', 'BOYS'),
('2023504062', 'Sanjay V',        'sanjay.ee@student.college.edu',   'student123', 'STUDENT', 'Kurunji (Boys Hostel)',  'HOSTEL-KUR', '+91 99440 98765', 'WARDEN-KUR', 'BOYS'),
('2024506012', 'Vigneshwaran K',  'vignesh.it@student.college.edu',  'student123', 'STUDENT', 'Kurunji (Boys Hostel)',  'HOSTEL-KUR', '+91 98840 12345', 'WARDEN-KUR', 'BOYS'),

('2022502088', 'Saravanan T',     'saravanan.ec@student.college.edu','student123', 'STUDENT', 'Bhavani (Boys Hostel)',  'HOSTEL-BHA', '+91 97890 22334', 'WARDEN-BHA', 'BOYS'),
('2023501077', 'Dinesh Babu R',   'dinesh.cs@student.college.edu',   'student123', 'STUDENT', 'Bhavani (Boys Hostel)',  'HOSTEL-BHA', '+91 98412 33445', 'WARDEN-BHA', 'BOYS'),
('2024503023', 'Praveen Kumar M', 'praveen.me@student.college.edu',  'student123', 'STUDENT', 'Bhavani (Boys Hostel)',  'HOSTEL-BHA', '+91 94451 99887', 'WARDEN-BHA', 'BOYS'),

('2023501142', 'Priya Dharshini M','priya.cs@student.college.edu',   'student123', 'STUDENT', 'Cauvery (Girls Hostel)', 'HOSTEL-CAU', '+91 97890 12345', 'WARDEN-CAU', 'GIRLS'),
('2023505015', 'Sneha Nair',       'sneha.ai@student.college.edu',    'student123', 'STUDENT', 'Cauvery (Girls Hostel)', 'HOSTEL-CAU', '+91 98945 61234', 'WARDEN-CAU', 'GIRLS'),
('2022506115', 'Deepa Lakshmi V',  'deepa.it@student.college.edu',    'student123', 'STUDENT', 'Cauvery (Girls Hostel)', 'HOSTEL-CAU', '+91 98421 98765', 'WARDEN-CAU', 'GIRLS'),

('2023507028', 'Ananya Ramesh',    'ananya.bt@student.college.edu',   'student123', 'STUDENT', 'Ponni (Girls Hostel)',   'HOSTEL-PON', '+91 97900 11223', 'WARDEN-PON', 'GIRLS'),
('2024502071', 'Kavitha S',        'kavitha.ec@student.college.edu',  'student123', 'STUDENT', 'Ponni (Girls Hostel)',   'HOSTEL-PON', '+91 94455 66778', 'WARDEN-PON', 'GIRLS'),
('2023506045', 'Harini Devi K',    'harini.it@student.college.edu',   'student123', 'STUDENT', 'Ponni (Girls Hostel)',   'HOSTEL-PON', '+91 96001 22334', 'WARDEN-PON', 'GIRLS'),

('2022501033', 'Divya Bharathi R', 'divya.cs@student.college.edu',    'student123', 'STUDENT', 'Vaigai (Girls Hostel)',   'HOSTEL-VAI', '+91 98402 77889', 'WARDEN-VAI', 'GIRLS'),
('2023502056', 'Nandhini M',       'nandhini.ec@student.college.edu', 'student123', 'STUDENT', 'Vaigai (Girls Hostel)',   'HOSTEL-VAI', '+91 94420 55667', 'WARDEN-VAI', 'GIRLS'),
('2024505090', 'Archana S',        'archana.ai@student.college.edu',  'student123', 'STUDENT', 'Vaigai (Girls Hostel)',   'HOSTEL-VAI', '+91 98845 33221', 'WARDEN-VAI', 'GIRLS')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    hostel_block = EXCLUDED.hostel_block,
    hostel_id = EXCLUDED.hostel_id,
    phone = EXCLUDED.phone,
    warden_id = EXCLUDED.warden_id,
    gender = EXCLUDED.gender;

-- Ensure ANY extra / legacy users are purged completely
DELETE FROM users 
WHERE id NOT IN (
    'WARDEN-MAR', 'WARDEN-KUR', 'WARDEN-BHA', 'WARDEN-CAU', 'WARDEN-PON', 'WARDEN-VAI',
    'SEC-BOYS', 'SEC-GIRLS',
    '2024506057', '2023506001', '2024501045',
    '2023503034', '2023504062', '2024506012',
    '2022502088', '2023501077', '2024503023',
    '2023501142', '2023505015', '2022506115',
    '2023507028', '2024502071', '2023506045',
    '2022501033', '2023502056', '2024505090'
);

-- 6. Insert Outpass Requests across Hostels with FK references
INSERT INTO outpass_requests (
    id, student_id, student_name, department, hostel_block, hostel_id, room_number, 
    outpass_type, destination, reason, departure_time, expected_return_time, 
    parent_name, parent_phone, parent_consent, status, warden_id, student_gender, warden_remarks, rejection_reason, approved_by,
    outbound_code, inbound_code, departure_verified_at, return_verified_at, out_time, in_time,
    created_at, updated_at
) VALUES
-- Marutham (Boys) -> WARDEN-MAR
(
    'OP-2026-001', '2024506057', 'Keertheswar S', 'Information Technology', 'Marutham (Boys Hostel)', 'HOSTEL-MAR', 'M-304',
    'WEEKEND_PASS', 'Trichy (Native Place)', 'Family function and weekend break.',
    NOW() + INTERVAL '2 hours', NOW() + INTERVAL '52 hours',
    'Senthil Nathan', '+91 94432 10987', 'CONFIRMED_VIA_SMS', 'PENDING',
    'WARDEN-MAR', 'BOYS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
),
(
    'OP-2026-003', '2023506001', 'Arvind Kumar R', 'Information Technology', 'Marutham (Boys Hostel)', 'HOSTEL-MAR', 'M-118',
    'DAY_PASS', 'Town Hall Electronics Market', 'Purchasing project sensors and components.',
    NOW() + INTERVAL '3 hours', NOW() + INTERVAL '8 hours',
    'R. Radhakrishnan', '+91 93456 78901', 'PENDING_CALL', 'PENDING',
    'WARDEN-MAR', 'BOYS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'
),

-- Kurunji (Boys) -> WARDEN-KUR
(
    'OP-2026-005', '2023503034', 'Mohammed Faizal', 'Mechanical Engineering', 'Kurunji (Boys Hostel)', 'HOSTEL-KUR', 'K-204',
    'DAY_PASS', 'PSG Tech Campus (Hackathon)', 'Representing college at 24-hour CAD design challenge.',
    NOW() + INTERVAL '4 hours', NOW() + INTERVAL '28 hours',
    'A. Abdul Faizal', '+91 99441 23890', 'PENDING_CALL', 'PENDING',
    'WARDEN-KUR', 'BOYS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '110 minutes', NOW() - INTERVAL '110 minutes'
),
(
    'OP-2026-009', '2023504062', 'Sanjay V', 'Electrical Engineering', 'Kurunji (Boys Hostel)', 'HOSTEL-KUR', 'K-312',
    'DAY_PASS', 'Local Power Substation / Industrial Visit', 'Field study for power systems project.',
    NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours',
    'V. Velmurugan', '+91 98411 77889', 'VERIFIED', 'APPROVED',
    'WARDEN-KUR', 'BOYS', 'Permission granted for academic study.', NULL, 'WARDEN-KUR',
    'OUT-5542', 'IN-5542', NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours'
),

-- Bhavani (Boys) -> WARDEN-BHA
(
    'OP-2026-007', '2022502088', 'Saravanan T', 'Electronics & Communication', 'Bhavani (Boys Hostel)', 'HOSTEL-BHA', 'B-101',
    'WEEKEND_PASS', 'Madurai (Native Place)', 'Family pilgrimage visit.',
    NOW() + INTERVAL '5 hours', NOW() + INTERVAL '48 hours',
    'T. Thangavel', '+91 98422 11223', 'VERIFIED', 'PENDING',
    'WARDEN-BHA', 'BOYS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '50 minutes', NOW() - INTERVAL '50 minutes'
),

-- Cauvery (Girls) -> WARDEN-CAU
(
    'OP-2026-002', '2023501142', 'Priya Dharshini M', 'Computer Science', 'Cauvery (Girls Hostel)', 'HOSTEL-CAU', 'C-214',
    'EMERGENCY_PASS', 'Apollo Clinic, Gandhipuram', 'Severe dental toothache, scheduled doctor appointment.',
    NOW() + INTERVAL '1 hour', NOW() + INTERVAL '5 hours',
    'Meenakshi Sundaram', '+91 94876 54321', 'VERIFIED', 'PENDING',
    'WARDEN-CAU', 'GIRLS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '25 minutes'
),
(
    'OP-2026-004', '2023505015', 'Sneha Nair', 'AI & Data Science', 'Cauvery (Girls Hostel)', 'HOSTEL-CAU', 'C-108',
    'WEEKEND_PASS', 'Palakkad, Kerala (Hometown)', 'Sister engagement ceremony at native place.',
    NOW() + INTERVAL '6 hours', NOW() + INTERVAL '60 hours',
    'S. Nair', '+91 97861 23456', 'VERIFIED', 'PENDING',
    'WARDEN-CAU', 'GIRLS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '70 minutes', NOW() - INTERVAL '70 minutes'
),

-- Ponni (Girls) -> WARDEN-PON
(
    'OP-2026-006', '2023507028', 'Ananya Ramesh', 'Biotechnology', 'Ponni (Girls Hostel)', 'HOSTEL-PON', 'P-115',
    'DAY_PASS', 'Brookefields Mall Coimbatore', 'Purchasing academic reference books and stationary.',
    NOW() - INTERVAL '3 hours', NOW() + INTERVAL '2 hours',
    'K. Ramesh', '+91 98840 55667', 'VERIFIED', 'APPROVED',
    'WARDEN-PON', 'GIRLS', 'Return strictly before 8:00 PM.', NULL, 'WARDEN-PON',
    'OUT-7821', 'IN-7821', NOW() - INTERVAL '150 minutes', NULL, NOW() - INTERVAL '150 minutes', NULL,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours'
),
(
    'OP-2026-010', '2024502071', 'Kavitha S', 'Electronics & Communication', 'Ponni (Girls Hostel)', 'HOSTEL-PON', 'P-202',
    'DAY_PASS', 'Cross Cut Road Market', 'Purchasing books and hostel essentials.',
    NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours',
    'S. Shanmugam', '+91 98402 33445', 'PENDING_CALL', 'PENDING',
    'WARDEN-PON', 'GIRLS', NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL,
    NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'
),

-- Vaigai (Girls) -> WARDEN-VAI
(
    'OP-2026-008', '2022501033', 'Divya Bharathi R', 'Computer Science', 'Vaigai (Girls Hostel)', 'HOSTEL-VAI', 'V-102',
    'VACATION_PASS', 'Tirunelveli (Hometown)', 'Semester vacation and family visit.',
    NOW() - INTERVAL '24 hours', NOW() - INTERVAL '2 hours',
    'R. Ramasamy', '+91 94431 88990', 'VERIFIED', 'COMPLETED',
    'WARDEN-VAI', 'GIRLS', 'Vacation pass sanctioned.', NULL, 'WARDEN-VAI',
    'OUT-3319', 'IN-3319', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '23 hours', NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '30 hours', NOW() - INTERVAL '3 hours'
)
ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id,
    student_name = EXCLUDED.student_name,
    department = EXCLUDED.department,
    hostel_block = EXCLUDED.hostel_block,
    hostel_id = EXCLUDED.hostel_id,
    room_number = EXCLUDED.room_number,
    outpass_type = EXCLUDED.outpass_type,
    destination = EXCLUDED.destination,
    reason = EXCLUDED.reason,
    departure_time = EXCLUDED.departure_time,
    expected_return_time = EXCLUDED.expected_return_time,
    parent_name = EXCLUDED.parent_name,
    parent_phone = EXCLUDED.parent_phone,
    parent_consent = EXCLUDED.parent_consent,
    status = EXCLUDED.status,
    warden_id = EXCLUDED.warden_id,
    student_gender = EXCLUDED.student_gender,
    warden_remarks = EXCLUDED.warden_remarks,
    rejection_reason = EXCLUDED.rejection_reason,
    approved_by = EXCLUDED.approved_by,
    outbound_code = EXCLUDED.outbound_code,
    inbound_code = EXCLUDED.inbound_code,
    departure_verified_at = EXCLUDED.departure_verified_at,
    return_verified_at = EXCLUDED.return_verified_at,
    out_time = EXCLUDED.out_time,
    in_time = EXCLUDED.in_time;
