import { pool } from '../db/pool';

export const listGrades = async (studentId: number, semester?: number, subjectId?: number) => {
  const params: any[] = [studentId];
  let filter = '';
  if (semester) {
    params.push(semester);
    filter += ` AND g.semester = $${params.length}`;
  }
  if (subjectId) {
    params.push(subjectId);
    filter += ` AND g.subject_id = $${params.length}`;
  }
  const query = `
    SELECT g.*, subj.name as subject_name
    FROM grades g
    JOIN subjects subj ON subj.id = g.subject_id
    WHERE g.student_id = $1 ${filter}
    ORDER BY g.exam_date DESC NULLS LAST
  `;
  const { rows } = await pool.query(query, params);
  return rows;
};

export const getGradeStats = async (studentId: number) => {
  const query = `
    SELECT semester,
           ROUND(AVG(score)::numeric,2) as average_score,
           COUNT(*) as exams
    FROM grades
    WHERE student_id = $1
    GROUP BY semester
    ORDER BY semester
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};
