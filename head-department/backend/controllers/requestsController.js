const db = require('../config/database');

/**
 * Get all absence requests for department
 */
const getAllAbsenceRequests = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { status } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        ar.id,
        ar.request_reason,
        ar.supporting_document,
        ar.status,
        ar.reviewed_at,
        ar.review_comment,
        ar.created_at,
        a.id as absence_id,
        a.absence_type,
        se.session_date,
        se.start_time,
        se.end_time,
        sub.name as subject_name,
        sub.code as subject_code,
        st.id as student_id,
        st.student_number,
        u.first_name || ' ' || u.last_name as student_name,
        u.email as student_email,
        g.name as group_name,
        sp.name as specialty_name,
        l.year_number,
        reviewer.first_name || ' ' || reviewer.last_name as reviewed_by_name
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN users u ON st.user_id = u.id
       JOIN sessions se ON a.session_id = se.id
       JOIN timetable_slots ts ON se.timetable_slot_id = ts.id
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON st.group_id = g.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON st.specialty_id = sp.id
       LEFT JOIN teachers rev_t ON ar.reviewed_by = rev_t.id
       LEFT JOIN users reviewer ON rev_t.user_id = reviewer.id
       WHERE sp.department_id = $1
    `;

    const params = [departmentId];

    if (status) {
      query += ` AND ar.status = $2`;
      params.push(status);
    }

    query += ' ORDER BY ar.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching absence requests:', error);
    res.status(500).json({ error: 'Failed to fetch absence requests' });
  }
};

/**
 * Get absence request by ID
 */
const getAbsenceRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        ar.*,
        a.absence_type,
        a.reason as absence_reason,
        se.session_date,
        se.start_time,
        se.end_time,
        sub.name as subject_name,
        st.student_number,
        u.first_name || ' ' || u.last_name as student_name,
        u.email as student_email,
        g.name as group_name
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN users u ON st.user_id = u.id
       JOIN sessions se ON a.session_id = se.id
       JOIN timetable_slots ts ON se.timetable_slot_id = ts.id
       JOIN subjects sub ON ts.subject_id = sub.id
       JOIN groups g ON st.group_id = g.id
       JOIN levels l ON g.level_id = l.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE ar.id = $1 AND sp.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Absence request not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching absence request:', error);
    res.status(500).json({ error: 'Failed to fetch absence request' });
  }
};

/**
 * Approve absence request
 */
const approveAbsenceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewComment } = req.body;
    const departmentId = req.user.department_id;

    // Get teacher ID from user
    const teacherResult = await db.query(
      'SELECT id FROM teachers WHERE user_id = $1',
      [req.user.id]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(403).json({ error: 'Department head teacher record not found' });
    }

    const teacherId = teacherResult.rows[0].id;

    // Verify request belongs to department
    const requestCheck = await db.query(
      `SELECT ar.id, ar.absence_id
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE ar.id = $1 AND sp.department_id = $2 AND ar.status = 'pending'`,
      [id, departmentId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pending absence request not found' });
    }

    const absenceId = requestCheck.rows[0].absence_id;

    // Start transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Update absence request
      await client.query(
        `UPDATE absence_requests 
         SET status = 'approved', 
             reviewed_by = $1, 
             reviewed_at = CURRENT_TIMESTAMP,
             review_comment = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [teacherId, reviewComment, id]
      );

      // Update absence type
      await client.query(
        `UPDATE absences 
         SET absence_type = 'justified',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [absenceId]
      );

      await client.query('COMMIT');

      res.json({ message: 'Absence request approved successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error approving absence request:', error);
    res.status(500).json({ error: 'Failed to approve absence request' });
  }
};

/**
 * Reject absence request
 */
const rejectAbsenceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewComment } = req.body;
    const departmentId = req.user.department_id;

    if (!reviewComment) {
      return res.status(400).json({ error: 'Review comment is required for rejection' });
    }

    // Get teacher ID from user
    const teacherResult = await db.query(
      'SELECT id FROM teachers WHERE user_id = $1',
      [req.user.id]
    );

    if (teacherResult.rows.length === 0) {
      return res.status(403).json({ error: 'Department head teacher record not found' });
    }

    const teacherId = teacherResult.rows[0].id;

    // Verify request belongs to department
    const requestCheck = await db.query(
      `SELECT ar.id
       FROM absence_requests ar
       JOIN absences a ON ar.absence_id = a.id
       JOIN students st ON a.student_id = st.id
       JOIN specialties sp ON st.specialty_id = sp.id
       WHERE ar.id = $1 AND sp.department_id = $2 AND ar.status = 'pending'`,
      [id, departmentId]
    );

    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pending absence request not found' });
    }

    // Update absence request
    await db.query(
      `UPDATE absence_requests 
       SET status = 'rejected', 
           reviewed_by = $1, 
           reviewed_at = CURRENT_TIMESTAMP,
           review_comment = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [teacherId, reviewComment, id]
    );

    res.json({ message: 'Absence request rejected successfully' });
  } catch (error) {
    console.error('Error rejecting absence request:', error);
    res.status(500).json({ error: 'Failed to reject absence request' });
  }
};

/**
 * Get all makeup sessions for department
 */
const getAllMakeupSessions = async (req, res) => {
  try {
    const departmentId = req.user.department_id;
    const { status } = req.query;

    if (!departmentId) {
      return res.status(400).json({ error: 'User is not assigned to any department' });
    }

    let query = `
      SELECT 
        ms.id,
        ms.session_date,
        ms.start_time,
        ms.end_time,
        ms.reason,
        ms.status,
        ms.created_at,
        sub.name as subject_name,
        sub.code as subject_code,
        g.name as group_name,
        r.name as room_name,
        r.code as room_code,
        u.first_name || ' ' || u.last_name as teacher_name,
        se.session_date as original_session_date
       FROM makeup_sessions ms
       JOIN teachers t ON ms.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN subjects sub ON ms.subject_id = sub.id
       JOIN groups g ON ms.group_id = g.id
       JOIN rooms r ON ms.room_id = r.id
       LEFT JOIN sessions se ON ms.original_session_id = se.id
       WHERE t.department_id = $1
    `;

    const params = [departmentId];

    if (status) {
      query += ` AND ms.status = $2`;
      params.push(status);
    }

    query += ' ORDER BY ms.session_date DESC, ms.start_time DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching makeup sessions:', error);
    res.status(500).json({ error: 'Failed to fetch makeup sessions' });
  }
};

/**
 * Get makeup session by ID
 */
const getMakeupSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentId = req.user.department_id;

    const result = await db.query(
      `SELECT 
        ms.id,
        ms.session_date,
        ms.start_time,
        ms.end_time,
        ms.reason,
        ms.status,
        ms.created_at,
        ms.notes,
        sub.name as subject_name,
        sub.code as subject_code,
        g.name as group_name,
        g.id as group_id,
        r.name as room_name,
        r.code as room_code,
        t.id as teacher_id,
        t.employee_id,
        u.first_name || ' ' || u.last_name as teacher_name,
        u.email as teacher_email,
        se.session_date as original_session_date,
        se.start_time as original_start_time,
        se.end_time as original_end_time
       FROM makeup_sessions ms
       JOIN teachers t ON ms.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN subjects sub ON ms.subject_id = sub.id
       JOIN groups g ON ms.group_id = g.id
       JOIN rooms r ON ms.room_id = r.id
       LEFT JOIN sessions se ON ms.original_session_id = se.id
       WHERE ms.id = $1 AND t.department_id = $2`,
      [id, departmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Makeup session not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching makeup session:', error);
    res.status(500).json({ error: 'Failed to fetch makeup session' });
  }
};

/**
 * Approve makeup session
 */
const approveMakeupSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewComment } = req.body;
    const departmentId = req.user.department_id;

    // Verify session belongs to department
    const sessionCheck = await db.query(
      `SELECT ms.id
       FROM makeup_sessions ms
       JOIN teachers t ON ms.teacher_id = t.id
       WHERE ms.id = $1 AND t.department_id = $2 AND ms.status = 'pending'`,
      [id, departmentId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pending makeup session not found' });
    }

    // Update makeup session status
    await db.query(
      `UPDATE makeup_sessions 
       SET status = 'approved', 
           notes = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [reviewComment || 'Approved by department head', id]
    );

    res.json({ message: 'Makeup session approved successfully' });
  } catch (error) {
    console.error('Error approving makeup session:', error);
    res.status(500).json({ error: 'Failed to approve makeup session' });
  }
};

/**
 * Reject makeup session
 */
const rejectMakeupSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewComment } = req.body;
    const departmentId = req.user.department_id;

    if (!reviewComment) {
      return res.status(400).json({ error: 'Review comment is required for rejection' });
    }

    // Verify session belongs to department
    const sessionCheck = await db.query(
      `SELECT ms.id
       FROM makeup_sessions ms
       JOIN teachers t ON ms.teacher_id = t.id
       WHERE ms.id = $1 AND t.department_id = $2 AND ms.status = 'pending'`,
      [id, departmentId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Pending makeup session not found' });
    }

    // Update makeup session status
    await db.query(
      `UPDATE makeup_sessions 
       SET status = 'rejected', 
           notes = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [reviewComment, id]
    );

    res.json({ message: 'Makeup session rejected successfully' });
  } catch (error) {
    console.error('Error rejecting makeup session:', error);
    res.status(500).json({ error: 'Failed to reject makeup session' });
  }
};

module.exports = {
  getAllAbsenceRequests,
  getAbsenceRequestById,
  approveAbsenceRequest,
  rejectAbsenceRequest,
  getAllMakeupSessions,
  getMakeupSessionById,
  approveMakeupSession,
  rejectMakeupSession
};
