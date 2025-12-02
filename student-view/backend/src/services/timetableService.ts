import { pool } from '../db/pool';

export const getWeeklyTimetable = async (studentId: number, weekStart: string, weekEnd: string) => {
  const query = `
    SELECT ts.id,
           ts.day_of_week,
           ts.start_time,
           ts.end_time,
           ts.room_id,
           ts.semester,
           subj.name as subject_name,
           subj.code as subject_code,
           t.id as teacher_id,
           u.first_name || ' ' || u.last_name as teacher_name,
           r.name as room_name,
           sess.session_date,
           sess.status,
           sess.is_makeup
    FROM students s
    JOIN timetable_slots ts ON ts.group_id = s.group_id
    JOIN subjects subj ON ts.subject_id = subj.id
    JOIN teachers t ON ts.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    JOIN rooms r ON ts.room_id = r.id
    LEFT JOIN sessions sess ON sess.timetable_slot_id = ts.id AND sess.session_date BETWEEN $2 AND $3
    WHERE s.id = $1 AND ts.is_active = true
    ORDER BY ts.day_of_week, ts.start_time
  `;
  const result = await pool.query(query, [studentId, weekStart, weekEnd]);
  return result.rows;
};
