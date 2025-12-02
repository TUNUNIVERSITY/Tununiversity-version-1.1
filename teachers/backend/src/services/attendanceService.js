const pool = require('../config/database');

class AttendanceService {
  /**
   * Get all students in a session with their attendance status
   * Returns: List of students with P (Present) or A (Absent) status
   */
  async getSessionAttendance(sessionId, teacherId) {
    const query = `
      SELECT 
        st.id as student_id,
        st.student_number,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        g.id as group_id,
        g.name as group_name,
        sess.session_date,
        sess.start_time,
        sess.end_time,
        subj.name as subject_name,
        subj.code as subject_code,
        -- Check if student is absent
        CASE 
          WHEN a.id IS NOT NULL THEN 'A'
          ELSE 'P'
        END as status,
        a.id as absence_id,
        a.absence_type,
        a.reason as absence_reason,
        a.marked_at
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN groups g ON ts.group_id = g.id
      INNER JOIN students st ON st.group_id = g.id
      INNER JOIN users u ON st.user_id = u.id
      LEFT JOIN absences a ON a.student_id = st.id AND a.session_id = sess.id
      WHERE sess.id = $1
        AND ts.teacher_id = $2
        AND u.is_active = true
      ORDER BY u.last_name, u.first_name
    `;

    const result = await pool.query(query, [sessionId, teacherId]);
    return result.rows;
  }

  /**
   * Mark student attendance for a session
   * status: 'P' (Present) or 'A' (Absent)
   */
  async markAttendance(data) {
    const { session_id, student_id, teacher_id, status, reason } = data;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify teacher teaches this session
      const verifyQuery = `
        SELECT sess.id 
        FROM sessions sess
        INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
        WHERE sess.id = $1 AND ts.teacher_id = $2
      `;
      const verifyResult = await client.query(verifyQuery, [session_id, teacher_id]);
      
      if (verifyResult.rows.length === 0) {
        throw new Error('Teacher is not authorized for this session');
      }

      if (status === 'A') {
        // Mark as absent - insert or update absence record
        const absenceQuery = `
          INSERT INTO absences (
            student_id, session_id, absence_type, marked_at, marked_by, reason, created_at, updated_at
          ) VALUES ($1, $2, 'unjustified', NOW(), $3, $4, NOW(), NOW())
          ON CONFLICT (student_id, session_id) 
          DO UPDATE SET
            absence_type = EXCLUDED.absence_type,
            marked_at = EXCLUDED.marked_at,
            marked_by = EXCLUDED.marked_by,
            reason = EXCLUDED.reason,
            updated_at = NOW()
          RETURNING id
        `;
        
        // Check if constraint exists, if not use regular insert
        try {
          await client.query(absenceQuery, [student_id, session_id, teacher_id, reason || null]);
        } catch (err) {
          if (err.code === '23505') { // Duplicate key error
            // Update existing record
            const updateQuery = `
              UPDATE absences 
              SET absence_type = 'unjustified',
                  marked_at = NOW(),
                  marked_by = $3,
                  reason = $4,
                  updated_at = NOW()
              WHERE student_id = $1 AND session_id = $2
              RETURNING id
            `;
            await client.query(updateQuery, [student_id, session_id, teacher_id, reason || null]);
          } else {
            throw err;
          }
        }
      } else if (status === 'P') {
        // Mark as present - delete absence record if exists
        await client.query(
          'DELETE FROM absences WHERE student_id = $1 AND session_id = $2',
          [student_id, session_id]
        );
      }

      await client.query('COMMIT');
      
      return { success: true, message: `Student marked as ${status === 'P' ? 'Present' : 'Absent'}` };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Bulk mark attendance for multiple students
   * attendanceList: [{ student_id, status, reason }]
   */
  async markBulkAttendance(sessionId, teacherId, attendanceList) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Verify teacher authorization
      const verifyQuery = `
        SELECT sess.id 
        FROM sessions sess
        INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
        WHERE sess.id = $1 AND ts.teacher_id = $2
      `;
      const verifyResult = await client.query(verifyQuery, [sessionId, teacherId]);
      
      if (verifyResult.rows.length === 0) {
        throw new Error('Teacher is not authorized for this session');
      }

      const results = [];

      for (const attendance of attendanceList) {
        const { student_id, status, reason } = attendance;

        if (status === 'A') {
          // Mark as absent
          try {
            await client.query(
              `INSERT INTO absences (
                student_id, session_id, absence_type, marked_at, marked_by, reason, created_at, updated_at
              ) VALUES ($1, $2, 'unjustified', NOW(), $3, $4, NOW(), NOW())`,
              [student_id, sessionId, teacherId, reason || null]
            );
          } catch (err) {
            if (err.code === '23505') {
              // Update if already exists
              await client.query(
                `UPDATE absences 
                SET absence_type = 'unjustified',
                    marked_at = NOW(),
                    marked_by = $3,
                    reason = $4,
                    updated_at = NOW()
                WHERE student_id = $1 AND session_id = $2`,
                [student_id, sessionId, teacherId, reason || null]
              );
            } else {
              throw err;
            }
          }
          results.push({ student_id, status: 'A', success: true });
        } else if (status === 'P') {
          // Mark as present (remove absence)
          await client.query(
            'DELETE FROM absences WHERE student_id = $1 AND session_id = $2',
            [student_id, sessionId]
          );
          results.push({ student_id, status: 'P', success: true });
        }
      }

      await client.query('COMMIT');
      
      return { 
        success: true, 
        message: 'Attendance marked successfully',
        results 
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get attendance statistics for a session
   */
  async getSessionStatistics(sessionId) {
    const query = `
      SELECT 
        COUNT(DISTINCT st.id) as total_students,
        COUNT(DISTINCT a.id) as total_absences,
        COUNT(DISTINCT st.id) - COUNT(DISTINCT a.id) as total_present,
        ROUND(
          (COUNT(DISTINCT st.id) - COUNT(DISTINCT a.id))::numeric / 
          NULLIF(COUNT(DISTINCT st.id), 0) * 100, 
          2
        ) as attendance_percentage
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN groups g ON ts.group_id = g.id
      INNER JOIN students st ON st.group_id = g.id
      INNER JOIN users u ON st.user_id = u.id
      LEFT JOIN absences a ON a.student_id = st.id AND a.session_id = sess.id
      WHERE sess.id = $1 AND u.is_active = true
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  }

  /**
   * Get attendance history for a student in a specific subject
   */
  async getStudentAttendanceHistory(studentId, subjectId, academicYear, semester) {
    const query = `
      SELECT 
        sess.id as session_id,
        sess.session_date,
        sess.start_time,
        sess.end_time,
        CASE 
          WHEN a.id IS NOT NULL THEN 'A'
          ELSE 'P'
        END as status,
        a.absence_type,
        a.reason as absence_reason,
        a.marked_at,
        subj.name as subject_name
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects subj ON ts.subject_id = subj.id
      INNER JOIN students st ON st.group_id = ts.group_id
      LEFT JOIN absences a ON a.student_id = st.id AND a.session_id = sess.id
      WHERE st.id = $1
        AND subj.id = $2
        AND ts.academic_year = $3
        AND ts.semester = $4
        AND sess.status = 'completed'
      ORDER BY sess.session_date DESC, sess.start_time DESC
    `;

    const result = await pool.query(query, [studentId, subjectId, academicYear, semester]);
    return result.rows;
  }
}

module.exports = new AttendanceService();
