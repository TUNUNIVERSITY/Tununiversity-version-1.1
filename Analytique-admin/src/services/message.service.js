const pool = require('../config/database');

class MessageService {
  // Helper for pagination
  getPaginationParams(query) {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }

  buildPaginationResponse(page, limit, totalCount) {
    const totalPages = Math.ceil(totalCount / limit);
    return {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  // Get inbox messages
  async getInboxMessages(userId, query) {
    const { page, limit, offset } = this.getPaginationParams(query);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM messages
      WHERE recipient_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get messages
    const messagesQuery = `
      SELECT 
        m.id as message_id, m.subject, m.content, m.is_read, m.created_at, m.read_at,
        m.parent_message_id,
        sender.id as sender_id, sender.first_name as sender_first_name,
        sender.last_name as sender_last_name, sender.email as sender_email,
        sender.role as sender_role
      FROM messages m
      INNER JOIN users sender ON m.sender_id = sender.id
      WHERE m.recipient_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(messagesQuery, [userId, limit, offset]);
    const pagination = this.buildPaginationResponse(page, limit, totalCount);

    return { messages: result.rows, pagination };
  }

  // Get sent messages
  async getSentMessages(userId, query) {
    const { page, limit, offset } = this.getPaginationParams(query);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM messages
      WHERE sender_id = $1
    `;
    const countResult = await pool.query(countQuery, [userId]);
    const totalCount = parseInt(countResult.rows[0].total);

    // Get messages
    const messagesQuery = `
      SELECT 
        m.id as message_id, m.subject, m.content, m.is_read, m.created_at, m.read_at,
        m.parent_message_id,
        recipient.id as recipient_id, recipient.first_name as recipient_first_name,
        recipient.last_name as recipient_last_name, recipient.email as recipient_email,
        recipient.role as recipient_role
      FROM messages m
      INNER JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.sender_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(messagesQuery, [userId, limit, offset]);
    const pagination = this.buildPaginationResponse(page, limit, totalCount);

    return { messages: result.rows, pagination };
  }

  // Get message by ID
  async getMessageById(messageId, userId) {
    const query = `
      SELECT 
        m.id as message_id, m.subject, m.content, m.is_read, m.created_at, m.read_at,
        m.parent_message_id,
        sender.id as sender_id, sender.first_name as sender_first_name,
        sender.last_name as sender_last_name, sender.email as sender_email,
        sender.role as sender_role,
        recipient.id as recipient_id, recipient.first_name as recipient_first_name,
        recipient.last_name as recipient_last_name, recipient.email as recipient_email,
        recipient.role as recipient_role
      FROM messages m
      INNER JOIN users sender ON m.sender_id = sender.id
      INNER JOIN users recipient ON m.recipient_id = recipient.id
      WHERE m.id = $1 AND (m.sender_id = $2 OR m.recipient_id = $2)
    `;

    const result = await pool.query(query, [messageId, userId]);
    return result.rows[0];
  }

  // Send message
  async sendMessage(messageData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert message
      const insertQuery = `
        INSERT INTO messages (
          sender_id, recipient_id, subject, content, 
          parent_message_id, is_read, created_at
        ) VALUES ($1, $2, $3, $4, $5, false, NOW())
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        messageData.sender_id,
        messageData.recipient_id,
        messageData.subject,
        messageData.content,
        messageData.parent_message_id || null,
      ]);

      const message = result.rows[0];

      // Create notification for recipient
      const notificationQuery = `
        INSERT INTO notifications (
          user_id, title, message, notification_type,
          is_read, related_entity_type, related_entity_id, created_at
        )
        SELECT 
          $1,
          'New Message',
          CONCAT('You have a new message from ', u.first_name, ' ', u.last_name),
          'general',
          false,
          'message',
          $2,
          NOW()
        FROM users u
        WHERE u.id = $3
      `;

      await client.query(notificationQuery, [
        messageData.recipient_id,
        message.id,
        messageData.sender_id,
      ]);

      await client.query('COMMIT');
      return message;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Search users by email (for composing messages)
  async searchUsersByEmail(searchTerm) {
    const query = `
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        CASE 
          WHEN t.id IS NOT NULL THEN t.employee_id
          WHEN st.id IS NOT NULL THEN st.student_number
          ELSE NULL
        END as identifier
      FROM users u
      LEFT JOIN teachers t ON u.id = t.user_id
      LEFT JOIN students st ON u.id = st.user_id
      WHERE u.email ILIKE $1
        AND u.is_active = true
      ORDER BY u.last_name, u.first_name
      LIMIT 10
    `;

    const result = await pool.query(query, [`%${searchTerm}%`]);
    return result.rows;
  }

  // Get user by email (exact match)
  async getUserByEmail(email) {
    const query = `
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role
      FROM users u
      WHERE u.email = $1 AND u.is_active = true
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Mark message as read
  async markAsRead(messageId, userId) {
    const query = `
      UPDATE messages
      SET is_read = true, read_at = NOW()
      WHERE id = $1 AND recipient_id = $2 AND is_read = false
      RETURNING *
    `;

    const result = await pool.query(query, [messageId, userId]);
    return result.rows[0];
  }

  // Reply to a message
  async replyToMessage(parentMessageId, messageData) {
    // First, get the parent message to get recipient info
    const parentQuery = `
      SELECT sender_id, recipient_id, subject
      FROM messages
      WHERE id = $1
    `;
    
    const parentResult = await pool.query(parentQuery, [parentMessageId]);
    
    if (parentResult.rows.length === 0) {
      throw new Error('Parent message not found');
    }
    
    const parentMessage = parentResult.rows[0];
    
    // Determine the recipient (original sender if current user is recipient, or original recipient if current user is sender)
    const replyRecipient = messageData.sender_id === parentMessage.sender_id 
      ? parentMessage.recipient_id 
      : parentMessage.sender_id;
    
    // Add "Re: " prefix to subject if not already present
    const replySubject = parentMessage.subject.startsWith('Re: ') 
      ? parentMessage.subject 
      : `Re: ${parentMessage.subject}`;
    
    // Send the reply with parent_message_id set
    return await this.sendMessage({
      sender_id: messageData.sender_id,
      recipient_id: replyRecipient,
      subject: replySubject,
      content: messageData.content,
      parent_message_id: parentMessageId
    });
  }
}

module.exports = new MessageService();
