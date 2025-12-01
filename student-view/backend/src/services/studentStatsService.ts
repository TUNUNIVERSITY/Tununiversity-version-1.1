import { pool } from '../db/pool';

export const getStudentStats = async (studentId: number) => {
  const absencePromise = pool.query(
    `SELECT COUNT(*)::int as total_absences,
            COUNT(*) FILTER (WHERE absence_type = 'unjustified')::int as unjustified
     FROM absences
     WHERE student_id = $1`,
    [studentId]
  );

  const gradePromise = pool.query(
    `SELECT ROUND(COALESCE(AVG(score / NULLIF(max_score, 0)), 0)::numeric, 2) as avg_ratio
     FROM grades
     WHERE student_id = $1`,
    [studentId]
  );

  const [absenceStats, gradeStats] = await Promise.all([absencePromise, gradePromise]);

  return {
    absences: absenceStats.rows[0] ?? { total_absences: 0, unjustified: 0 },
    grades: gradeStats.rows[0] ?? { avg_ratio: 0 },
  };
};
