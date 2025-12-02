const db = require('../config/database');

/**
 * Get absence analytics for department
 */
const getAbsenceAnalytics = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { startDate, endDate, groupId, specialtyId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    // Absence trends over time
    let trendQuery = `
      SELECT 
        DATE(se.session_date) as date,
        COUNT(a.id) as total_absences,
        SUM(CASE WHEN a.absence_type = 'justified' THEN 1 ELSE 0 END) as justified,
        SUM(CASE WHEN a.absence_type = 'unjustified' THEN 1 ELSE 0 END) as unjustified
       FROM absences a
       JOIN students st ON a.student_id = st.id
       JOIN specialties sp ON st.specialty_id = sp.id
       JOIN sessions se ON a.session_id = se.id
       WHERE sp.department_id = $1
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (startDate) {
      trendQuery += ` AND se.session_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      trendQuery += ` AND se.session_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (groupId) {
      trendQuery += ` AND st.group_id = $${paramIndex}`;
      params.push(parseInt(groupId));
      paramIndex++;
    }

    if (specialtyId) {
      trendQuery += ` AND sp.id = $${paramIndex}`;
      params.push(parseInt(specialtyId));
      paramIndex++;
    }

    trendQuery += ' GROUP BY DATE(se.session_date) ORDER BY date DESC LIMIT 30';

    const trendResult = await db.query(trendQuery, params);

    // Absence by subject
    let subjectQuery = `
      SELECT 
        sub.name as subject_name,
        sub.code as subject_code,
        COUNT(a.id) as total_absences,
        COUNT(DISTINCT st.id) as affected_students
       FROM absences a
       JOIN students st ON a.student_id = st.id
       JOIN sessions se ON a.session_id = se.id
       JOIN timetable_slots ts ON se.timetable_slot_id = ts.id
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1
    `;

    const subjectParams = [departmentId];
    let subjectParamIndex = 2;

    if (startDate) {
      subjectQuery += ` AND se.session_date >= $${subjectParamIndex}`;
      subjectParams.push(startDate);
      subjectParamIndex++;
    }

    if (endDate) {
      subjectQuery += ` AND se.session_date <= $${subjectParamIndex}`;
      subjectParams.push(endDate);
      subjectParamIndex++;
    }

    subjectQuery += ' GROUP BY sub.id, sub.name, sub.code ORDER BY total_absences DESC LIMIT 10';

    const subjectResult = await db.query(subjectQuery, subjectParams);

    // Top students with most absences
    let studentsQuery = `
      SELECT 
        st.student_number,
        u.first_name || ' ' || u.last_name as student_name,
        g.name as group_name,
        sp.name as specialty_name,
        COUNT(a.id) as total_absences,
        SUM(CASE WHEN a.absence_type = 'unjustified' THEN 1 ELSE 0 END) as unjustified_absences
       FROM absences a
       JOIN students st ON a.student_id = st.id
       JOIN users u ON st.user_id = u.id
       JOIN groups g ON st.group_id = g.id
       JOIN specialties sp ON st.specialty_id = sp.id
       JOIN sessions se ON a.session_id = se.id
       WHERE sp.department_id = $1
    `;

    const studentsParams = [departmentId];
    let studentsParamIndex = 2;

    if (startDate) {
      studentsQuery += ` AND se.session_date >= $${studentsParamIndex}`;
      studentsParams.push(startDate);
      studentsParamIndex++;
    }

    if (endDate) {
      studentsQuery += ` AND se.session_date <= $${studentsParamIndex}`;
      studentsParams.push(endDate);
      studentsParamIndex++;
    }

    studentsQuery += ' GROUP BY st.id, st.student_number, u.first_name, u.last_name, g.name, sp.name ORDER BY total_absences DESC LIMIT 10';

    const studentsResult = await db.query(studentsQuery, studentsParams);

    res.json({
      trends: trendResult.rows,
      bySubject: subjectResult.rows,
      topStudents: studentsResult.rows
    });
  } catch (error) {
    console.error('Error fetching absence analytics:', error);
    res.status(500).json({ error: 'Failed to fetch absence analytics' });
  }
};

/**
 * Get room occupancy analytics
 */
const getRoomOccupancyAnalytics = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { academicYear, semester } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        r.id,
        r.code,
        r.name,
        r.capacity,
        r.room_type,
        COUNT(DISTINCT ts.id) as total_slots,
        COUNT(DISTINCT CONCAT(ts.day_of_week, ts.start_time)) as unique_time_slots,
        ROUND(COUNT(DISTINCT ts.id)::numeric / NULLIF((7 * 8), 0) * 100, 2) as occupancy_rate
       FROM rooms r
       LEFT JOIN timetable_slots ts ON r.id = ts.room_id AND ts.is_active = true
       LEFT JOIN groups g ON ts.group_id = g.id
       LEFT JOIN levels l ON g.level_id = l.id
       LEFT JOIN specialties sp ON l.specialty_id = sp.id
       WHERE (sp.department_id = $1 OR sp.department_id IS NULL)
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (academicYear) {
      query += ` AND (ts.academic_year = $${paramIndex} OR ts.academic_year IS NULL)`;
      params.push(academicYear);
      paramIndex++;
    }

    if (semester) {
      query += ` AND (ts.semester = $${paramIndex} OR ts.semester IS NULL)`;
      params.push(parseInt(semester));
      paramIndex++;
    }

    query += ' GROUP BY r.id, r.code, r.name, r.capacity, r.room_type ORDER BY occupancy_rate DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching room occupancy analytics:', error);
    res.status(500).json({ error: 'Failed to fetch room occupancy analytics' });
  }
};

/**
 * Get teacher workload analytics
 */
const getTeacherWorkloadAnalytics = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { academicYear, semester } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        t.id,
        t.employee_id,
        u.first_name || ' ' || u.last_name as teacher_name,
        COUNT(DISTINCT ts.id) as total_classes,
        COUNT(DISTINCT ts.subject_id) as total_subjects,
        COUNT(DISTINCT ts.group_id) as total_groups,
        COALESCE(SUM(EXTRACT(EPOCH FROM (ts.end_time::time - ts.start_time::time))/3600), 0) as weekly_hours
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN timetable_slots ts ON t.id = ts.teacher_id AND ts.is_active = true
       WHERE t.department_id = $1
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (academicYear) {
      query += ` AND (ts.academic_year = $${paramIndex} OR ts.academic_year IS NULL)`;
      params.push(academicYear);
      paramIndex++;
    }

    if (semester) {
      query += ` AND (ts.semester = $${paramIndex} OR ts.semester IS NULL)`;
      params.push(parseInt(semester));
      paramIndex++;
    }

    query += ' GROUP BY t.id, t.employee_id, u.first_name, u.last_name ORDER BY weekly_hours DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teacher workload analytics:', error);
    res.status(500).json({ error: 'Failed to fetch teacher workload analytics' });
  }
};

/**
 * Get student performance analytics
 */
const getStudentPerformanceAnalytics = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { academicYear, semester, specialtyId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        sp.name as specialty_name,
        l.year_number,
        COUNT(DISTINCT st.id) as total_students,
        ROUND(AVG(gr.score), 2) as average_score,
        ROUND(MIN(gr.score), 2) as min_score,
        ROUND(MAX(gr.score), 2) as max_score,
        COUNT(DISTINCT gr.id) as total_exams
       FROM students st
       JOIN specialties sp ON st.specialty_id = sp.id
       JOIN groups g ON st.group_id = g.id
       JOIN levels l ON g.level_id = l.id
       LEFT JOIN grades gr ON st.id = gr.student_id
       WHERE sp.department_id = $1
    `;

    const params = [departmentId];
    let paramIndex = 2;

    if (academicYear) {
      query += ` AND (gr.academic_year = $${paramIndex} OR gr.academic_year IS NULL)`;
      params.push(academicYear);
      paramIndex++;
    }

    if (semester) {
      query += ` AND (gr.semester = $${paramIndex} OR gr.semester IS NULL)`;
      params.push(parseInt(semester));
      paramIndex++;
    }

    if (specialtyId) {
      query += ` AND sp.id = $${paramIndex}`;
      params.push(parseInt(specialtyId));
      paramIndex++;
    }

    query += ' GROUP BY sp.id, sp.name, l.year_number ORDER BY sp.name, l.year_number';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching student performance analytics:', error);
    res.status(500).json({ error: 'Failed to fetch student performance analytics' });
  }
};

/**
 * Get department summary statistics
 */
const getDepartmentSummary = async (req, res) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    // Get various counts
    const summary = {};

    // Total teachers
    const teachersResult = await db.query(
      'SELECT COUNT(*) as count FROM teachers WHERE department_id = $1',
      [departmentId]
    );
    summary.totalTeachers = parseInt(teachersResult.rows[0].count);

    // Total students
    const studentsResult = await db.query(
      `SELECT COUNT(DISTINCT st.id) as count 
       FROM students st
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1`,
      [departmentId]
    );
    summary.totalStudents = parseInt(studentsResult.rows[0].count);

    // Total specialties
    const specialtiesResult = await db.query(
      'SELECT COUNT(*) as count FROM specialties WHERE department_id = $1',
      [departmentId]
    );
    summary.totalSpecialties = parseInt(specialtiesResult.rows[0].count);

    // Total groups
    const groupsResult = await db.query(
      `SELECT COUNT(DISTINCT g.id) as count
       FROM groups g
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1`,
      [departmentId]
    );
    summary.totalGroups = parseInt(groupsResult.rows[0].count);

    // Total subjects
    const subjectsResult = await db.query(
      `SELECT COUNT(DISTINCT sub.id) as count
       FROM subjects sub
       JOIN levels l ON sub.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1`,
      [departmentId]
    );
    summary.totalSubjects = parseInt(subjectsResult.rows[0].count);

    // Active timetable slots
    const slotsResult = await db.query(
      `SELECT COUNT(DISTINCT ts.id) as count
       FROM timetable_slots ts
       JOIN groups g ON ts.group_id = g.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON l.specialty_id = sp.id
       WHERE sp.department_id = $1 AND ts.is_active = true`,
      [departmentId]
    );
    summary.activeTimetableSlots = parseInt(slotsResult.rows[0].count);

    // Pending requests
    const requestsResult = await db.query(
      `SELECT COUNT(*) as count
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE sp.department_id = $1 AND ar.status = 'pending'`,
      [departmentId]
    );
    summary.pendingRequests = parseInt(requestsResult.rows[0].count);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching department summary:', error);
    res.status(500).json({ error: 'Failed to fetch department summary' });
  }
};

module.exports = {
  getAbsenceAnalytics,
  getRoomOccupancyAnalytics,
  getTeacherWorkloadAnalytics,
  getStudentPerformanceAnalytics,
  getDepartmentSummary
};
