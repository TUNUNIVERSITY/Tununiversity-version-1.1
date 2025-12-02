const pool = require('../config/database');

class MakeupSessionService {
  // Create makeup session
  async createMakeupSession(sessionData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert makeup session
      const insertQuery = `
        INSERT INTO makeup_sessions (
          original_session_id, teacher_id, subject_id, group_id, room_id,
          session_date, start_time, end_time, reason, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'scheduled', NOW(), NOW())
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        sessionData.original_session_id || null,
        sessionData.teacher_id,
        sessionData.subject_id,
        sessionData.group_id,
        sessionData.room_id || null,
        sessionData.session_date,
        sessionData.start_time,
        sessionData.end_time,
        sessionData.reason,
      ]);

      const makeupSession = result.rows[0];

      // Create notifications for all students in the group
      const notificationQuery = `
        INSERT INTO notifications (
          user_id, title, message, notification_type,
          is_read, related_entity_type, related_entity_id, created_at
        )
        SELECT 
          u.id,
          'Make-Up Session Scheduled',
          CONCAT('A make-up session for ', subj.name, ' has been scheduled on ', $1::text, ' at ', $2::text),
          'timetable',
          false,
          'makeup_session',
          $3,
          NOW()
        FROM students st
        INNER JOIN users u ON st.user_id = u.id
        INNER JOIN subjects subj ON subj.id = $4
        WHERE st.group_id = $5
      `;

      await client.query(notificationQuery, [
        sessionData.session_date,
        sessionData.start_time,
        makeupSession.id,
        sessionData.subject_id,
        sessionData.group_id,
      ]);

      await client.query('COMMIT');
      return makeupSession;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get makeup sessions for teacher
  async getTeacherMakeupSessions(teacherId, filters = {}) {
    let query = `
      SELECT 
        ms.id as makeup_session_id, ms.session_date, ms.start_time, ms.end_time,
        ms.reason, ms.status, ms.created_at,
        subj.id as subject_id, subj.name as subject_name, subj.code as subject_code,
        g.id as group_id, g.name as group_name,
        r.id as room_id, r.name as room_name, r.building,
        orig_sess.id as original_session_id, orig_sess.session_date as original_date,
        COUNT(DISTINCT stud.id) as student_count
      FROM makeup_sessions ms
      INNER JOIN subjects subj ON ms.subject_id = subj.id
      INNER JOIN groups g ON ms.group_id = g.id
      LEFT JOIN rooms r ON ms.room_id = r.id
      LEFT JOIN sessions orig_sess ON ms.original_session_id = orig_sess.id
      LEFT JOIN students stud ON stud.group_id = g.id
      WHERE ms.teacher_id = $1
    `;

    const params = [teacherId];
    let paramIndex = 2;

    if (filters.status) {
      query += ` AND ms.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.from_date) {
      query += ` AND ms.session_date >= $${paramIndex}`;
      params.push(filters.from_date);
      paramIndex++;
    }

    query += `
      GROUP BY ms.id, ms.session_date, ms.start_time, ms.end_time, ms.reason, ms.status, ms.created_at,
               subj.id, subj.name, subj.code, g.id, g.name, r.id, r.name, r.building,
               orig_sess.id, orig_sess.session_date
      ORDER BY ms.session_date DESC, ms.start_time DESC
    `;

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = new MakeupSessionService();
