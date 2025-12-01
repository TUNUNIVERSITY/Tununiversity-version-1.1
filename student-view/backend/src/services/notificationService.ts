import { pool } from '../db/pool';

export const listNotifications = async (userId: number, type?: string, limit = 20, offset = 0) => {
  const params: any[] = [userId];
  let filter = '';
  if (type) {
    params.push(type);
    filter = ` AND notification_type = $${params.length}`;
  }
  params.push(limit, offset);
  const query = `
    SELECT *
    FROM notifications
    WHERE user_id = $1 ${filter}
    ORDER BY created_at DESC
    LIMIT $${params.length - 1}
    OFFSET $${params.length}
  `;
  const { rows } = await pool.query(query, params);
  return rows;
};

export const markNotificationRead = async (id: number, userId: number) => {
  const query = `
    UPDATE notifications
    SET is_read = true, read_at = NOW()
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, userId]);
  return rows[0] ?? null;
};
