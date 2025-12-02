import { pool } from '../db/pool';

export const createAbsenceRequest = async (
  studentId: number,
  absenceId: number,
  reason: string,
  fileUrl?: string
) => {
  const query = `
    INSERT INTO absence_requests (absence_id, student_id, request_reason, supporting_document)
    SELECT $1, $2, $3, $4
    WHERE EXISTS (SELECT 1 FROM absences WHERE id = $1 AND student_id = $2)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [absenceId, studentId, reason, fileUrl ?? null]);
  return rows[0] ?? null;
};

export const listAbsenceRequests = async (studentId: number) => {
  const query = `
    SELECT ar.*, abs.absence_type, abs.reason as original_reason
    FROM absence_requests ar
    JOIN absences abs ON ar.absence_id = abs.id
    WHERE ar.student_id = $1
    ORDER BY ar.created_at DESC
  `;
  const { rows } = await pool.query(query, [studentId]);
  return rows;
};
