// SQL Column Mapping Fix Script
// ===========================================
// ACTUAL DATABASE SCHEMA (from university_platform):
// ===========================================
//
// students table columns:
// - id, user_id, student_number, group_id, specialty_id, enrollment_date
// - first_name/last_name are in USERS table (join via user_id)
// - level_id does NOT exist (get through groups.level_id)
//
// grades table columns:
// - id, student_id, subject_id, exam_type, SCORE (not "grade")
// - max_score, exam_date, academic_year, semester
//
// absences table columns:
// - id, student_id, session_id, absence_type, MARKED_AT (not "date")
// - marked_by, reason, supporting_document
//
// sessions table columns:
// - id, timetable_slot_id, session_date, start_time, end_time, room_id
// - Does NOT have subject_id directly (get through timetable_slots)
//
// levels table columns:
// - id, name, code, specialty_id, year_number
// - Does NOT have "description"
//
// groups table columns:
// - id, name, code, level_id, max_students
// - Does NOT have "specialty_id"
//
// ===========================================
// REQUIRED FIXES:
// ===========================================
//
// 1. Replace: s.first_name, s.last_name
//    With: u.first_name, u.last_name (and JOIN users u ON u.id = s.user_id)
//
// 2. Replace: s.level_id
//    With: g.level_id (and ensure groups g is joined)
//
// 3. Replace: g.grade
//    With: g.score
//
// 4. Replace: a.date
//    With: a.marked_at
//
// 5. Replace: ses.subject_id
//    With: ts.subject_id (and ensure timetable_slots ts is joined)
//
// 6. Remove: description from levels SELECT
//
// 7. Remove: specialty_id from groups SELECT

module.exports = {
  // Fix patterns
  fixes: [
    { pattern: 's.first_name', replacement: 'u.first_name', note: 'Add JOIN users u ON u.id = s.user_id' },
    { pattern: 's.last_name', replacement: 'u.last_name', note: 'Add JOIN users u ON u.id = s.user_id' },
    { pattern: 's.level_id', replacement: 'g.level_id OR l.id via groups', note: 'Join through groups' },
    { pattern: 'g.grade', replacement: 'g.score', note: 'Column renamed' },
    { pattern: 'a.date', replacement: 'a.marked_at', note: 'Column renamed' },
    { pattern: 'ses.subject_id', replacement: 'ts.subject_id', note: 'Get from timetable_slots' }
  ]
};
