const pool = require('../config/database');

class TeacherService {
  // Get teacher profile by ID
  async getTeacherById(teacherId) {
    const query = `
      SELECT 
        t.id, t.employee_id, t.specialization, t.phone, t.hire_date,
        u.id as user_id, u.first_name, u.last_name, u.email, u.cin,
        d.id as department_id, d.name as department_name
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.id = $1 AND u.is_active = true
    `;
    
    const result = await pool.query(query, [teacherId]);
    return result.rows[0];
  }

  // Get teacher by user_id
  async getTeacherByUserId(userId) {
    const query = `
      SELECT 
        t.id, t.employee_id, t.specialization, t.phone, t.hire_date,
        u.id as user_id, u.first_name, u.last_name, u.email, u.cin,
        d.id as department_id, d.name as department_name
      FROM teachers t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN departments d ON t.department_id = d.id
      WHERE t.user_id = $1 AND u.is_active = true
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get subjects taught by teacher
  async getTeacherSubjects(teacherId, filters = {}) {
    let query = `
      SELECT 
        ts.id, ts.academic_year, ts.semester,
        s.id as subject_id, s.name as subject_name, s.code as subject_code,
        g.id as group_id, g.name as group_name,
        COUNT(DISTINCT stud.id) as student_count
      FROM teacher_subjects ts
      INNER JOIN subjects s ON ts.subject_id = s.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN students stud ON stud.group_id = g.id
      WHERE ts.teacher_id = $1
    `;
    
    const params = [teacherId];
    let paramIndex = 2;

    if (filters.academic_year) {
      query += ` AND ts.academic_year = $${paramIndex}`;
      params.push(filters.academic_year);
      paramIndex++;
    }

    if (filters.semester) {
      query += ` AND ts.semester = $${paramIndex}`;
      params.push(filters.semester);
      paramIndex++;
    }

    query += `
      GROUP BY ts.id, ts.academic_year, ts.semester, s.id, s.name, s.code, g.id, g.name
      ORDER BY ts.academic_year DESC, ts.semester DESC, s.name
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get groups taught by teacher
  async getTeacherGroups(teacherId, filters = {}) {
    let query = `
      SELECT DISTINCT
        g.id as group_id, 
        g.name as group_name, 
        g.code as group_code,
        l.name as level_name,
        l.code as level_code,
        ts.academic_year, 
        ts.semester,
        COUNT(DISTINCT stud.id) as student_count
      FROM teacher_subjects ts
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN levels l ON g.level_id = l.id
      LEFT JOIN students stud ON stud.group_id = g.id
      WHERE ts.teacher_id = $1
    `;
    
    const params = [teacherId];
    let paramIndex = 2;

    if (filters.academic_year) {
      query += ` AND ts.academic_year = $${paramIndex}`;
      params.push(filters.academic_year);
      paramIndex++;
    }

    if (filters.semester) {
      query += ` AND ts.semester = $${paramIndex}`;
      params.push(filters.semester);
      paramIndex++;
    }

    query += `
      GROUP BY g.id, g.name, g.code, l.name, l.code, ts.academic_year, ts.semester
      ORDER BY g.name
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new TeacherService();
