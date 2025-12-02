const pool = require('../config/database');

class AbsenceService {
  // Report an absence
  async reportAbsence(absenceData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if absence already exists
      const existingCheck = await client.query(
        'SELECT id FROM absences WHERE student_id = $1 AND session_id = $2',
        [absenceData.student_id, absenceData.session_id]
      );

      if (existingCheck.rows.length > 0) {
        throw new Error('Absence already reported for this student in this session');
      }

      // Insert absence
      const insertQuery = `
        INSERT INTO absences (
          student_id, session_id, absence_type, marked_by, reason, 
          supporting_document, marked_at, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        absenceData.student_id,
        absenceData.session_id,
        absenceData.absence_type || 'unjustified',
        absenceData.marked_by,
        absenceData.reason,
        absenceData.supporting_document || null,
      ]);

      // Create notification for student
      const notificationQuery = `
        INSERT INTO notifications (
          user_id, title, message, notification_type, 
          is_read, related_entity_type, related_entity_id, created_at
        )
        SELECT 
          u.id,
          'Absence Reported',
          CONCAT('You have been marked absent for ', subj.name, ' on ', sess.session_date),
          'absence',
          false,
          'absence',
          $1,
          NOW()
        FROM students st
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN sessions sess ON sess.id = $2
        INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
        INNER JOIN subjects subj ON ts.subject_id = subj.id
        WHERE st.id = $3
      `;

      await client.query(notificationQuery, [
        result.rows[0].id,
        absenceData.session_id,
        absenceData.student_id,
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get absences reported by teacher
  async getReportedAbsences(teacherId, filters = {}) {
    let query = `
      SELECT 
        a.id as absence_id, a.absence_type, a.reason, a.marked_at,
        a.supporting_document,
        st.id as student_id, st.student_number,
        u.first_name as student_first_name, u.last_name as student_last_name,
        sess.id as session_id, sess.session_date, sess.start_time, sess.end_time,
        subj.id as subject_id, subj.name as subject_name, subj.code as subject_code,
        g.id as group_id, g.name as group_name,
        ar.id as request_id, ar.status as request_status
      FROM absences a
      INNER JOIN students st ON a.student_id = st.id
      INNER JOIN users u ON st.user_id = u.id
      INNER JOIN sessions sess ON a.session_id = sess.id
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN absence_requests ar ON ar.absence_id = a.id
      WHERE a.marked_by = $1
    `;

    const params = [teacherId];
    let paramIndex = 2;

    if (filters.absence_type) {
      query += ` AND a.absence_type = $${paramIndex}`;
      params.push(filters.absence_type);
      paramIndex++;
    }

    if (filters.from_date) {
      query += ` AND sess.session_date >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }

    if (filters.to_date) {
      query += ` AND sess.session_date <= $${paramIndex}`;
      params.push(filters.to_date);
      paramIndex++;
    }

    query += ` ORDER BY sess.session_date DESC, sess.start_time DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get absences for a specific session
  async getSessionAbsences(sessionId) {
    const query = `
      SELECT 
        a.id as absence_id, a.absence_type, a.reason, a.marked_at,
        a.supporting_document,
        st.id as student_id, st.student_number,
        u.first_name as student_first_name, u.last_name as student_last_name,
        u.email as student_email,
        ar.id as request_id, ar.status as request_status, ar.request_reason
      FROM absences a
      INNER JOIN students st ON a.student_id = st.id
      INNER JOIN users u ON st.user_id = u.id
      LEFT JOIN absence_requests ar ON ar.absence_id = a.id
      WHERE a.session_id = $1
      ORDER BY u.last_name, u.first_name
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }
}

module.exports = new AbsenceService();
