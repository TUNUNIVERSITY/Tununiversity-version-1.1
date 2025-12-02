const pool = require('../config/database');

class AbsenceRequestService {
  // Get absence requests for teacher
  async getTeacherAbsenceRequests(teacherId, filters = {}) {
    let query = `
      SELECT 
        ar.id as request_id, ar.request_reason, ar.supporting_document,
        ar.status, ar.reviewed_at, ar.review_comment, ar.created_at,
        a.id as absence_id, a.absence_type, a.reason as absence_reason,
        st.id as student_id, st.student_number,
        u.first_name as student_first_name, u.last_name as student_last_name,
        u.email as student_email,
        sess.id as session_id, sess.session_date, sess.start_time, sess.end_time,
        subj.id as subject_id, subj.name as subject_name, subj.code as subject_code,
        g.id as group_id, g.name as group_name
      FROM absence_requests ar
      INNER JOIN absences a ON ar.absence_id = a.id
      INNER JOIN students st ON ar.student_id = st.id
      INNER JOIN users u ON st.user_id = u.id
      INNER JOIN sessions sess ON a.session_id = sess.id
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN groups g ON ts.group_id = g.id
      WHERE ts.teacher_id = $1
    `;

    const params = [teacherId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND ar.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ` ORDER BY ar.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Approve absence request
  async approveAbsenceRequest(requestId, teacherId, reviewComment = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update absence request
      const updateRequestQuery = `
        UPDATE absence_requests
        SET status = 'approved',
            reviewed_by = $1,
            reviewed_at = NOW(),
            review_comment = $2,
            updated_at = NOW()
        WHERE id = $3 AND status = 'pending'
        RETURNING *
      `;

      const requestResult = await client.query(updateRequestQuery, [
        teacherId,
        reviewComment,
        requestId,
      ]);

      if (requestResult.rows.length === 0) {
        throw new Error('Request not found or already reviewed');
      }

      const request = requestResult.rows[0];

      // Update absence type to justified
      await client.query(
        `UPDATE absences SET absence_type = 'justified', updated_at = NOW() WHERE id = $1`,
        [request.absence_id]
      );

      // Create notification for student
      const notificationQuery = `
        INSERT INTO notifications (
          user_id, title, message, notification_type,
          is_read, related_entity_type, related_entity_id, created_at
        )
        SELECT 
          u.id,
          'Absence Request Approved',
          CONCAT('Your absence request for ', subj.name, ' on ', sess.session_date, ' has been approved'),
          'absence',
          false,
          'absence_request',
          $1,
          NOW()
        FROM absence_requests ar
        INNER JOIN students st ON ar.student_id = st.id
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN absences a ON ar.absence_id = a.id
        INNER JOIN sessions sess ON a.session_id = sess.id
        INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
        INNER JOIN subjects subj ON ts.subject_id = subj.id
        WHERE ar.id = $1
      `;

      await client.query(notificationQuery, [requestId]);

      await client.query('COMMIT');
      return requestResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Reject absence request
  async rejectAbsenceRequest(requestId, teacherId, reviewComment = null) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update absence request
      const updateRequestQuery = `
        UPDATE absence_requests
        SET status = 'rejected',
            reviewed_by = $1,
            reviewed_at = NOW(),
            review_comment = $2,
            updated_at = NOW()
        WHERE id = $3 AND status = 'pending'
        RETURNING *
      `;

      const requestResult = await client.query(updateRequestQuery, [
        teacherId,
        reviewComment,
        requestId,
      ]);

      if (requestResult.rows.length === 0) {
        throw new Error('Request not found or already reviewed');
      }

      const request = requestResult.rows[0];

      // Keep absence as unjustified (no change needed)

      // Create notification for student
      const notificationQuery = `
        INSERT INTO notifications (
          user_id, title, message, notification_type,
          is_read, related_entity_type, related_entity_id, created_at
        )
        SELECT 
          u.id,
          'Absence Request Rejected',
          CONCAT('Your absence request for ', subj.name, ' on ', sess.session_date, ' has been rejected'),
          'absence',
          false,
          'absence_request',
          $1,
          NOW()
        FROM absence_requests ar
        INNER JOIN students st ON ar.student_id = st.id
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN absences a ON ar.absence_id = a.id
        INNER JOIN sessions sess ON a.session_id = sess.id
        INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
        INNER JOIN subjects subj ON ts.subject_id = subj.id
        WHERE ar.id = $1
      `;

      await client.query(notificationQuery, [requestId]);

      await client.query('COMMIT');
      return requestResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = new AbsenceRequestService();
