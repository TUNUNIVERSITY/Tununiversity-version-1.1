const pool = require('../config/database');

class SessionService {
  // Get teacher's timetable
  async getTeacherTimetable(teacherId, filters = {}) {
    let query = `
      SELECT 
        ts.id as slot_id, ts.day_of_week, ts.start_time, ts.end_time,
        ts.academic_year, ts.semester, ts.is_active,
        s.id as subject_id, s.name as subject_name, s.code as subject_code,
        g.id as group_id, g.name as group_name,
        r.id as room_id, r.name as room_name, r.building
      FROM timetable_slots ts
      INNER JOIN subjects s ON ts.subject_id = s.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN rooms r ON ts.room_id = r.id
      WHERE ts.teacher_id = $1 AND ts.is_active = true
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

    query += ` ORDER BY ts.day_of_week, ts.start_time`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get today's sessions for teacher
  async getTodaySessions(teacherId) {
    const query = `
      SELECT 
        sess.id as session_id, sess.session_date, sess.start_time, sess.end_time,
        sess.status, sess.is_makeup, sess.cancellation_reason,
        s.id as subject_id, s.name as subject_name, s.code as subject_code,
        g.id as group_id, g.name as group_name,
        r.id as room_id, r.name as room_name, r.building,
        ts.id as slot_id,
        COUNT(DISTINCT stud.id) as total_students,
        COUNT(DISTINCT a.id) as total_absences
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects s ON ts.subject_id = s.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN rooms r ON sess.room_id = r.id
      LEFT JOIN students stud ON stud.group_id = g.id
      LEFT JOIN absences a ON a.session_id = sess.id
      WHERE ts.teacher_id = $1 
        AND sess.session_date = CURRENT_DATE
        AND sess.status != 'cancelled'
      GROUP BY sess.id, sess.session_date, sess.start_time, sess.end_time,
               sess.status, sess.is_makeup, sess.cancellation_reason,
               s.id, s.name, s.code, g.id, g.name, r.id, r.name, r.building, ts.id
      ORDER BY sess.start_time
    `;
    
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }

  // Get week's sessions for teacher
  async getWeekSessions(teacherId) {
    const query = `
      SELECT 
        sess.id as session_id, sess.session_date, sess.start_time, sess.end_time,
        sess.status, sess.is_makeup, sess.cancellation_reason,
        s.id as subject_id, s.name as subject_name, s.code as subject_code,
        g.id as group_id, g.name as group_name,
        r.id as room_id, r.name as room_name, r.building,
        ts.id as slot_id,
        COUNT(DISTINCT stud.id) as total_students,
        COUNT(DISTINCT a.id) as total_absences
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects s ON ts.subject_id = s.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN rooms r ON sess.room_id = r.id
      LEFT JOIN students stud ON stud.group_id = g.id
      LEFT JOIN absences a ON a.session_id = sess.id
      WHERE ts.teacher_id = $1 
        AND sess.session_date >= CURRENT_DATE
        AND sess.session_date < CURRENT_DATE + INTERVAL '7 days'
        AND sess.status != 'cancelled'
      GROUP BY sess.id, sess.session_date, sess.start_time, sess.end_time,
               sess.status, sess.is_makeup, sess.cancellation_reason,
               s.id, s.name, s.code, g.id, g.name, r.id, r.name, r.building, ts.id
      ORDER BY sess.session_date, sess.start_time
    `;
    
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }

  // Get session details by ID
  async getSessionById(sessionId) {
    const query = `
      SELECT 
        sess.id as session_id, sess.session_date, sess.start_time, sess.end_time,
        sess.status, sess.is_makeup, sess.cancellation_reason,
        s.id as subject_id, s.name as subject_name, s.code as subject_code,
        g.id as group_id, g.name as group_name,
        r.id as room_id, r.name as room_name, r.building,
        ts.id as slot_id, ts.teacher_id,
        t.id as teacher_id, t.employee_id,
        u.first_name as teacher_first_name, u.last_name as teacher_last_name,
        COUNT(DISTINCT stud.id) as total_students,
        COUNT(DISTINCT a.id) as total_absences
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN subjects s ON ts.subject_id = s.id
      INNER JOIN groups g ON ts.group_id = g.id
      LEFT JOIN rooms r ON sess.room_id = r.id
      INNER JOIN teachers t ON ts.teacher_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN students stud ON stud.group_id = g.id
      LEFT JOIN absences a ON a.session_id = sess.id
      WHERE sess.id = $1
      GROUP BY sess.id, sess.session_date, sess.start_time, sess.end_time,
               sess.status, sess.is_makeup, sess.cancellation_reason,
               s.id, s.name, s.code, g.id, g.name, r.id, r.name, r.building,
               ts.id, ts.teacher_id, t.id, t.employee_id, u.first_name, u.last_name
    `;
    
    const result = await pool.query(query, [sessionId]);
    return result.rows[0];
  }

  // Get students for a session (with absence status)
  async getSessionStudents(sessionId) {
    const query = `
      SELECT 
        st.id as student_id, st.student_number,
        u.first_name, u.last_name, u.email,
        a.id as absence_id, a.absence_type, a.reason as absence_reason,
        a.marked_at
      FROM sessions sess
      INNER JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
      INNER JOIN students st ON st.group_id = ts.group_id
      INNER JOIN users u ON st.user_id = u.id
      LEFT JOIN absences a ON a.student_id = st.id AND a.session_id = sess.id
      WHERE sess.id = $1
      ORDER BY u.last_name, u.first_name
    `;
    
    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }
}

module.exports = new SessionService();
