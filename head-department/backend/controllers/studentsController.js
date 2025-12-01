const db = require('../config/database');

/**
 * Get all students in department
 */
const getAllStudents = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { groupId, specialtyId, levelId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        st.id,
        st.student_number,
        st.enrollment_date,
        st.date_of_birth,
        st.phone,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        g.id as group_id,
        g.name as group_name,
        g.code as group_code,
        l.id as level_id,
        l.name as level_name,
        l.year_number,
        sp.id as specialty_id,
        sp.name as specialty_name,
        sp.code as specialty_code
       FROM students st
       JOIN users u ON st.user_id = u.id
       JOIN groups g ON st.group_id = g.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (groupId) {
      query += ` AND g.id = $${paramIndex}`;
      params.push(parseInt(groupId));
      paramIndex++;
    }

    if (specialtyId) {
      query += ` AND sp.id = $${paramIndex}`;
      params.push(parseInt(specialtyId));
      paramIndex++;
    }

    if (levelId) {
      query += ` AND l.id = $${paramIndex}`;
      params.push(parseInt(levelId));
      paramIndex++;
    }

    query += ' ORDER BY sp.name, l.year_number, g.name, u.last_name, u.first_name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

/**
 * Get student by ID
 */
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        st.*,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        g.name as group_name,
        g.code as group_code,
        sp.name as specialty_name,
        l.name as level_name,
        l.year_number
       FROM students st
       JOIN users u ON st.user_id = u.id
       JOIN groups g ON st.group_id = g.id
       JOIN specialties sp ON st.specialty_id = sp.id
       JOIN levels l ON g.level_id = l.id
       WHERE st.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get student's absences
    const absencesResult = await db.query(
      `SELECT 
        a.id,
        a.absence_type,
        a.marked_at,
        a.reason,
        se.session_date,
        se.start_time,
        se.end_time,
        sub.name as subject_name,
        ts.academic_year,
        ts.semester
       FROM absences a
       JOIN sessions se ON a.session_id = se.id
       JOIN timetable_slots ts ON se.timetable_slot_id = ts.id
       JOIN subjects sub ON ts.subject_id = sub.id
       WHERE a.student_id = $1
       ORDER BY se.session_date DESC, se.start_time DESC
       LIMIT 50`,
      [id]
    );

    // Get student's grades
    const gradesResult = await db.query(
      `SELECT 
        gr.id,
        gr.exam_type,
        gr.score,
        gr.max_score,
        gr.exam_date,
        gr.academic_year,
        gr.semester,
        sub.name as subject_name,
        sub.code as subject_code
       FROM grades gr
       JOIN subjects sub ON gr.subject_id = sub.id
       WHERE gr.student_id = $1
       ORDER BY gr.academic_year DESC, gr.semester DESC, gr.exam_date DESC`,
      [id]
    );

    res.json({
      ...result.rows[0],
      absences: absencesResult.rows,
      grades: gradesResult.rows
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

/**
 * Get student statistics
 */
const getStudentStats = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    // Verify student belongs to department
    const studentCheck = await db.query(
      `SELECT st.id FROM students st
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE st.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get total absences
    const absencesResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN absence_type = 'justified' THEN 1 ELSE 0 END) as justified,
        SUM(CASE WHEN absence_type = 'unjustified' THEN 1 ELSE 0 END) as unjustified,
        SUM(CASE WHEN absence_type = 'pending' THEN 1 ELSE 0 END) as pending
       FROM absences
       WHERE student_id = $1`,
      [id]
    );

    // Get average grade
    const gradesResult = await db.query(
      `SELECT 
        COALESCE(AVG(score), 0) as average,
        COUNT(*) as total_exams
       FROM grades
       WHERE student_id = $1`,
      [id]
    );

    res.json({
      absences: {
        total: parseInt(absencesResult.rows[0].total),
        justified: parseInt(absencesResult.rows[0].justified),
        unjustified: parseInt(absencesResult.rows[0].unjustified),
        pending: parseInt(absencesResult.rows[0].pending)
      },
      grades: {
        average: parseFloat(gradesResult.rows[0].average).toFixed(2),
        totalExams: parseInt(gradesResult.rows[0].total_exams)
      }
    });
  } catch (error) {
    console.error('Error fetching student stats:', error);
    res.status(500).json({ error: 'Failed to fetch student statistics' });
  }
};

/**
 * Delete (deactivate) student
 */
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    // Verify student belongs to department
    const studentCheck = await db.query(
      `SELECT st.id, st.user_id FROM students st
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE st.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const userId = studentCheck.rows[0].user_id;

    // Deactivate user account
    await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  getStudentStats,
  deleteStudent
};
