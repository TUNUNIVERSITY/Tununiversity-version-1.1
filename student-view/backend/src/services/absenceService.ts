import { pool } from '../db/pool';

export const listAbsences = async (studentId: number, from?: string, to?: string) => {
  const params: any[] = [studentId];
  let filter = '';
  if (from) {
    params.push(from);
    filter += ` AND sess.session_date >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    filter += ` AND sess.session_date <= $${params.length}`;
  }
  const query = `
    SELECT abs.id,
           abs.absence_type,
           abs.reason,
           abs.supporting_document,
           sess.session_date,
           subj.name as subject_name,
           u.first_name || ' ' || u.last_name as teacher_name
    FROM absences abs
    JOIN sessions sess ON abs.session_id = sess.id
    JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
    JOIN subjects subj ON ts.subject_id = subj.id
    JOIN teachers t ON ts.teacher_id = t.id
    JOIN users u ON t.user_id = u.id
    WHERE abs.student_id = $1 ${filter}
    ORDER BY sess.session_date DESC
  `;
  const { rows } = await pool.query(query, params);
  return rows;
};

export const getAbsenceStats = async (studentId: number) => {
  const query = `
    SELECT subj.name as subject,
           COUNT(*)::int as missed
    FROM absences abs
    JOIN sessions sess ON abs.session_id = sess.id
    JOIN timetable_slots ts ON sess.timetable_slot_id = ts.id
    JOIN subjects subj ON ts.subject_id = subj.id
    WHERE abs.student_id = $1
    GROUP BY subj.name
    ORDER BY missed DESC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};
