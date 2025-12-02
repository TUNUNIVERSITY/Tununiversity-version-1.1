const db = require('../config/database');

/**
 * Get dashboard statistics for department head
 */
const getDashboardStats = async (req, res) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    // Get total teachers in department
    const teachersResult = await db.query(
      'SELECT COUNT(*) as count FROM teachers WHERE department_id = $1',
      [departmentId]
    );

    // Get total students in department (through specialties)
    const studentsResult = await db.query(
      `SELECT COUNT(DISTINCT s.id) as count 
       FROM students s
       JOIN specialties sp ON s.specialty_id = sp.id
       WHERE sp.department_id = $1`,
      [departmentId]
    );

    // Get total subjects in department (through levels and specialties)
    const subjectsResult = await db.query(
      `SELECT COUNT(DISTINCT sub.id) as count
       FROM subjects sub
       JOIN levels l ON sub.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1`,
      [departmentId]
    );

    // Get total groups in department
    const groupsResult = await db.query(
      `SELECT COUNT(DISTINCT g.id) as count
       FROM groups g
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1`,
      [departmentId]
    );

    // Get pending absence requests
    const pendingRequestsResult = await db.query(
      `SELECT COUNT(*) as count
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1 AND ar.status = 'pending'`,
      [departmentId]
    );

    // Get today's sessions count
    const todaySessionsResult = await db.query(
      `SELECT COUNT(*) as count
       FROM sessions se
       JOIN timetable_slots ts ON se.timetable_slot_id = ts.id
       JOIN groups g ON ts.group_id = g.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1 
       AND se.session_date = CURRENT_DATE
       AND se.status = 'scheduled'`,
      [departmentId]
    );

    // Get recent absences (last 7 days)
    const recentAbsencesResult = await db.query(
      `SELECT COUNT(*) as count
       FROM absences a
       JOIN students st ON a.student_id = st.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1
       AND a.created_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [departmentId]
    );

    res.json({
      teachers: parseInt(teachersResult.rows[0].count),
      students: parseInt(studentsResult.rows[0].count),
      subjects: parseInt(subjectsResult.rows[0].count),
      groups: parseInt(groupsResult.rows[0].count),
      pendingRequests: parseInt(pendingRequestsResult.rows[0].count),
      todaySessions: parseInt(todaySessionsResult.rows[0].count),
      recentAbsences: parseInt(recentAbsencesResult.rows[0].count)
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/**
 * Get recent activity for department
 */
const getRecentActivity = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const limit = parseInt(req.query.limit) || 10;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    const result = await db.query(
      `SELECT 
        'absence_request' as type,
        ar.id,
        ar.created_at,
        u.first_name || ' ' || u.last_name as student_name,
        ar.status,
        ar.request_reason as description
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN users u ON st.user_id = u.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1
       ORDER BY ar.created_at DESC
       LIMIT $2`,
      [departmentId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

/**
 * Get upcoming sessions for today and tomorrow
 */
const getUpcomingSessions = async (req, res) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    const result = await db.query(
      `SELECT 
        se.id,
        se.session_date,
        se.start_time,
        se.end_time,
        se.status,
        sub.name as subject_name,
        sub.code as subject_code,
        g.name as group_name,
        r.name as room_name,
        r.code as room_code,
        u.first_name || ' ' || u.last_name as teacher_name
       FROM sessions se
       JOIN timetable_slots ts ON se.timetable_slot_id = ts.id
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON ts.group_id = g.id
       JOIN rooms r ON se.room_id = r.id
       JOIN teachers t ON ts.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1
       AND se.session_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day'
       AND se.status = 'scheduled'
       ORDER BY se.session_date, se.start_time
       LIMIT 20`,
      [departmentId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming sessions' });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivity,
  getUpcomingSessions
};
