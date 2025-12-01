import { pool } from '../db/pool';

export const getStudentProfile = async (studentId: number) => {
  const query = `
    SELECT s.id as student_id,
           u.first_name,
           u.last_name,
           u.email,
           s.student_number,
           g.name as group_name,
           g.code as group_code,
           l.name as level_name,
           sp.name as specialty_name
    FROM students s
    JOIN users u ON s.user_id = u.id
    JOIN groups g ON s.group_id = g.id
    JOIN levels l ON g.level_id = l.id
    JOIN specialties sp ON s.specialty_id = sp.id
    WHERE s.id = $1
  `;
  const result = await pool.query(query, [studentId]);
  if (result.rows.length === 0) return null;
  return result.rows[0];
};
