const pool = require('../config/database');

class ReportsService {
  // ------------------ ABSENCES REPORT ------------------
  async getAbsencesReport(filters = {}) {
    const { startDate, endDate, departmentId, studentId, subjectId, limit, offset } = filters;
    let query = `
      SELECT a.id, a.marked_at as absence_date, a.absence_type,
        s.id as student_id, u.first_name, u.last_name, u.email,
        sub.name as subject_name, d.name as department_name,
        g.name as group_name
      FROM absences a
      JOIN students s ON s.id = a.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN groups g ON g.id = s.group_id
      LEFT JOIN specialties sp ON sp.id = s.specialty_id
      LEFT JOIN departments d ON d.id = sp.department_id
      LEFT JOIN sessions ses ON ses.id = a.session_id
      LEFT JOIN timetable_slots ts ON ts.id = ses.timetable_slot_id
      LEFT JOIN subjects sub ON sub.id = ts.subject_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (startDate) { query += ` AND a.marked_at >= $${idx}`; params.push(startDate); idx++; }
    if (endDate) { query += ` AND a.marked_at <= $${idx}`; params.push(endDate); idx++; }
    if (departmentId) { query += ` AND d.id = $${idx}`; params.push(departmentId); idx++; }
    if (studentId) { query += ` AND s.id = $${idx}`; params.push(studentId); idx++; }
    if (subjectId) { query += ` AND sub.id = $${idx}`; params.push(subjectId); idx++; }
    query += ' ORDER BY a.marked_at DESC';
    if (limit) { query += ` LIMIT $${idx}`; params.push(limit); idx++; }
    if (offset) { query += ` OFFSET $${idx}`; params.push(offset); idx++; }
    const data = (await pool.query(query, params)).rows;

    // summary
    const summaryQuery = `
      SELECT COUNT(DISTINCT a.id) as total_absences,
             COUNT(DISTINCT a.student_id) as total_students
      FROM absences a
      LEFT JOIN students s ON s.id = a.student_id
      LEFT JOIN specialties sp ON sp.id = s.specialty_id
      LEFT JOIN departments d ON d.id = sp.department_id
      WHERE 1=1
      ${startDate ? `AND a.marked_at >= '${startDate}'` : ''}
      ${endDate ? `AND a.marked_at <= '${endDate}'` : ''}
    `;
    const summary = (await pool.query(summaryQuery)).rows[0];

    return { data, summary };
  }

  // ------------------ GRADES REPORT ------------------
  async getGradesReport(filters = {}) {
    const { startDate, endDate, departmentId, studentId, subjectId, levelId, limit, offset } = filters;
    let query = `
      SELECT g.id, g.score as grade, g.exam_date, g.exam_type,
        s.id as student_id, u.first_name, u.last_name, u.email,
        sub.name as subject_name, d.name as department_name, l.name as level_name, gr.name as group_name
      FROM grades g
      JOIN students s ON s.id = g.student_id
      JOIN users u ON u.id = s.user_id
      LEFT JOIN groups gr ON gr.id = s.group_id
      LEFT JOIN levels l ON l.id = gr.level_id
      LEFT JOIN specialties sp ON sp.id = s.specialty_id
      LEFT JOIN departments d ON d.id = sp.department_id
      LEFT JOIN subjects sub ON sub.id = g.subject_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (startDate) { query += ` AND g.exam_date >= $${idx}`; params.push(startDate); idx++; }
    if (endDate) { query += ` AND g.exam_date <= $${idx}`; params.push(endDate); idx++; }
    if (departmentId) { query += ` AND d.id = $${idx}`; params.push(departmentId); idx++; }
    if (studentId) { query += ` AND s.id = $${idx}`; params.push(studentId); idx++; }
    if (subjectId) { query += ` AND sub.id = $${idx}`; params.push(subjectId); idx++; }
    if (levelId) { query += ` AND l.id = $${idx}`; params.push(levelId); idx++; }
    query += ' ORDER BY g.exam_date DESC';
    if (limit) { query += ` LIMIT $${idx}`; params.push(limit); idx++; }
    if (offset) { query += ` OFFSET $${idx}`; params.push(offset); idx++; }

    const data = (await pool.query(query, params)).rows;

    const summaryQuery = `
      SELECT ROUND(AVG(score)::numeric, 2) as average_grade,
             COUNT(DISTINCT student_id) as total_students,
             COUNT(DISTINCT CASE WHEN score >= 10 THEN student_id END) as passed_students,
             ROUND((COUNT(DISTINCT CASE WHEN score >= 10 THEN student_id END)::numeric / NULLIF(COUNT(DISTINCT student_id),0) *100),2) as success_rate
      FROM grades
      WHERE 1=1
      ${startDate ? `AND exam_date >= '${startDate}'` : ''}
      ${endDate ? `AND exam_date <= '${endDate}'` : ''}
    `;
    const summary = (await pool.query(summaryQuery)).rows[0];

    return { data, summary };
  }

  // ------------------ STUDENTS REPORT ------------------
  async getStudentsReport(filters = {}) {
    const { departmentId, specialtyId, levelId, groupId, limit, offset } = filters;
    let query = `
      SELECT s.id, s.student_number as cne, u.first_name, u.last_name, u.email, s.phone,
        d.name as department_name, sp.name as specialty_name, l.name as level_name, g.name as group_name,
        s.enrollment_date, u.created_at as registration_date
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN groups g ON g.id = s.group_id
      LEFT JOIN levels l ON l.id = g.level_id
      LEFT JOIN specialties sp ON sp.id = s.specialty_id
      LEFT JOIN departments d ON d.id = sp.department_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (departmentId) { query += ` AND d.id = $${idx}`; params.push(departmentId); idx++; }
    if (specialtyId) { query += ` AND sp.id = $${idx}`; params.push(specialtyId); idx++; }
    if (levelId) { query += ` AND l.id = $${idx}`; params.push(levelId); idx++; }
    if (groupId) { query += ` AND g.id = $${idx}`; params.push(groupId); idx++; }
    query += ' ORDER BY u.last_name, u.first_name';
    if (limit) { query += ` LIMIT $${idx}`; params.push(limit); idx++; }
    if (offset) { query += ` OFFSET $${idx}`; params.push(offset); idx++; }

    return (await pool.query(query, params)).rows;
  }

  // ------------------ TEACHERS & SUBJECTS REPORT ------------------
  async getTeachersSubjectsReport(filters = {}) {
    const { departmentId, teacherId, subjectId, limit, offset } = filters;
    let query = `
      SELECT t.id as teacher_id, u.first_name, u.last_name, u.email, t.phone as teacher_phone,
        d.name as department_name, sub.id as subject_id, sub.name as subject_name
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      LEFT JOIN departments d ON d.id = t.department_id
      LEFT JOIN teacher_subjects ts ON ts.teacher_id = t.id
      LEFT JOIN subjects sub ON sub.id = ts.subject_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;
    if (departmentId) { query += ` AND d.id = $${idx}`; params.push(departmentId); idx++; }
    if (teacherId) { query += ` AND t.id = $${idx}`; params.push(teacherId); idx++; }
    if (subjectId) { query += ` AND sub.id = $${idx}`; params.push(subjectId); idx++; }
    query += ' ORDER BY u.last_name, u.first_name, sub.name';
    if (limit) { query += ` LIMIT $${idx}`; params.push(limit); idx++; }
    if (offset) { query += ` OFFSET $${idx}`; params.push(offset); idx++; }

    return (await pool.query(query, params)).rows;
  }
}

module.exports = new ReportsService();
