const db = require('../config/database');

/**
 * Get all teachers in department
 */
const getAllTeachers = async (req, res) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    const result = await db.query(
      `SELECT 
        t.id,
        t.employee_id,
        t.specialization,
        t.phone,
        t.hire_date,
        t.created_at,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        d.name as department_name,
        COUNT(DISTINCT ts.id) as total_classes
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       JOIN departments d ON t.department_id = d.id
       LEFT JOIN timetable_slots ts ON t.id = ts.teacher_id AND ts.is_active = true
       WHERE t.department_id = $1
       GROUP BY t.id, u.id, d.id
       ORDER BY u.last_name, u.first_name`,
      [departmentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

/**
 * Get teacher by ID
 */
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        t.*,
        u.email,
        u.first_name,
        u.last_name,
        u.is_active,
        d.name as department_name
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       JOIN departments d ON t.department_id = d.id
       WHERE t.id = $1 AND t.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get teacher's subjects
    const subjectsResult = await db.query(
      `SELECT DISTINCT
        sub.id,
        sub.name,
        sub.code,
        g.name as group_name
       FROM timetable_slots ts
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON ts.group_id = g.id
       WHERE ts.teacher_id = $1 AND ts.is_active = true
       ORDER BY sub.name`,
      [id]
    );

    // Get teacher's timetable
    const timetableResult = await db.query(
      `SELECT 
        ts.id,
        ts.day_of_week,
        ts.start_time,
        ts.end_time,
        sub.name as subject_name,
        g.name as group_name,
        r.name as room_name
       FROM timetable_slots ts
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON ts.group_id = g.id
       JOIN rooms r ON ts.room_id = r.id
       WHERE ts.teacher_id = $1 AND ts.is_active = true
       ORDER BY ts.day_of_week, ts.start_time`,
      [id]
    );

    res.json({
      ...result.rows[0],
      subjects: subjectsResult.rows,
      timetable: timetableResult.rows
    });
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
};

/**
 * Get teacher statistics
 */
const getTeacherStats = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    // Verify teacher belongs to department
    const teacherCheck = await db.query(
      'SELECT id FROM teachers WHERE id = $1 AND department_id = $2',
      [id, departmentId]
    );

    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Get total classes
    const classesResult = await db.query(
      'SELECT COUNT(*) as count FROM timetable_slots WHERE teacher_id = $1 AND is_active = true',
      [id]
    );

    // Get total students taught
    const studentsResult = await db.query(
      `SELECT COUNT(DISTINCT st.id) as count
       FROM students st
       JOIN groups g ON st.group_id = g.id
       JOIN timetable_slots ts ON g.id = ts.group_id
       WHERE ts.teacher_id = $1 AND ts.is_active = true`,
      [id]
    );

    // Get total hours per week
    const hoursResult = await db.query(
      `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (end_time - start_time))/3600), 0) as hours
       FROM timetable_slots
       WHERE teacher_id = $1 AND is_active = true`,
      [id]
    );

    res.json({
      totalClasses: parseInt(classesResult.rows[0].count),
      totalStudents: parseInt(studentsResult.rows[0].count),
      weeklyHours: parseFloat(hoursResult.rows[0].hours).toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching teacher stats:', error);
    res.status(500).json({ error: 'Failed to fetch teacher statistics' });
  }
};

/**
 * Delete (deactivate) teacher
 */
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    // Verify teacher belongs to department
    const teacherCheck = await db.query(
      'SELECT id, user_id FROM teachers WHERE id = $1 AND department_id = $2',
      [id, departmentId]
    );

    if (teacherCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    const userId = teacherCheck.rows[0].user_id;

    // Check if teacher is the current user (department head)
    if (userId === req.user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }

    // Deactivate user account
    await db.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Teacher deactivated successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  getTeacherStats,
  deleteTeacher
};
