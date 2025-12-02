import { pool } from '../db/pool';

export const listInboxMessages = async (userId: number, limit = 20, offset = 0) => {
  const { rows } = await pool.query(
    `SELECT m.*, u.first_name || ' ' || u.last_name as sender_name, u.email as sender_email
     FROM messages m
     JOIN users u ON u.id = m.sender_id
     WHERE recipient_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

export const listSentMessages = async (userId: number, limit = 20, offset = 0) => {
  const { rows } = await pool.query(
    `SELECT m.*, u.first_name || ' ' || u.last_name as recipient_name, u.email as recipient_email
     FROM messages m
     JOIN users u ON u.id = m.recipient_id
     WHERE sender_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

export const getThread = async (messageId: number, userId: number) => {
  const { rows } = await pool.query(
    `WITH RECURSIVE thread AS (
        SELECT * FROM messages WHERE id = $1 AND (sender_id = $2 OR recipient_id = $2)
        UNION ALL
        SELECT m.* FROM messages m
        JOIN thread t ON m.parent_message_id = t.id
    )
     SELECT * FROM thread ORDER BY created_at ASC`,
    [messageId, userId]
  );
  return rows;
};

export const getUserIdByEmail = async (email: string) => {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  return rows[0]?.id;
};

export const sendMessage = async (
  senderId: number,
  recipientId: number,
  subject: string,
  content: string,
  parentMessageId?: number
) => {
  const { rows } = await pool.query(
    `INSERT INTO messages (sender_id, recipient_id, subject, content, parent_message_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [senderId, recipientId, subject, content, parentMessageId ?? null]
  );
  return rows[0];
};

export const markMessageRead = async (messageId: number, userId: number) => {
  const { rows } = await pool.query(
    `UPDATE messages SET is_read = true, read_at = NOW()
     WHERE id = $1 AND recipient_id = $2
     RETURNING *`,
    [messageId, userId]
  );
  return rows[0] ?? null;
};
