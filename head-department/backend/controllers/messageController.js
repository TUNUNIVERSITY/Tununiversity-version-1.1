const db = require('../config/database');
const pool = db.pool;

class MessageController {
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

  // GET /messages/inbox
  async getInbox(req, res, next) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
        });
      }

      const { page, limit, offset } = this.getPaginationParams(req.query);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM messages
        WHERE recipient_id = $1
      `;
      const countResult = await pool.query(countQuery, [user_id]);
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

      const result = await pool.query(messagesQuery, [user_id, limit, offset]);
      const pagination = this.buildPaginationResponse(page, limit, totalCount);

      return res.status(200).json({
        success: true,
        message: 'Inbox messages retrieved successfully',
        data: result.rows,
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/sent
  async getSent(req, res, next) {
    try {
      const { user_id } = req.query;
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
        });
      }

      const { page, limit, offset } = this.getPaginationParams(req.query);

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM messages
        WHERE sender_id = $1
      `;
      const countResult = await pool.query(countQuery, [user_id]);
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

      const result = await pool.query(messagesQuery, [user_id, limit, offset]);
      const pagination = this.buildPaginationResponse(page, limit, totalCount);

      return res.status(200).json({
        success: true,
        message: 'Sent messages retrieved successfully',
        data: result.rows,
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/:id
  async getMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
        });
      }

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

      const result = await pool.query(query, [id, user_id]);
      const message = result.rows[0];

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Auto-mark as read if user is recipient
      if (message.recipient_id == user_id && !message.is_read) {
        const updateQuery = `
          UPDATE messages
          SET is_read = true, read_at = NOW()
          WHERE id = $1 AND recipient_id = $2
        `;
        await pool.query(updateQuery, [id, user_id]);
        message.is_read = true;
        message.read_at = new Date();
      }

      return res.status(200).json({
        success: true,
        message: 'Message retrieved successfully',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /messages/send
  async sendMessage(req, res, next) {
    const client = await pool.connect();

    try {
      const { sender_id, recipient_id, subject, content, parent_message_id } = req.body;

      if (!sender_id || !recipient_id || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: 'sender_id, recipient_id, subject, and content are required'
        });
      }

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
        sender_id,
        recipient_id,
        subject,
        content,
        parent_message_id || null,
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
        recipient_id,
        message.id,
        sender_id,
      ]);

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }

  // POST /messages/:id/reply
  async replyToMessage(req, res, next) {
    const client = await pool.connect();

    try {
      const { id } = req.params;
      const { sender_id, content } = req.body;

      if (!sender_id || !content) {
        return res.status(400).json({
          success: false,
          message: 'sender_id and content are required'
        });
      }

      // Get parent message
      const parentQuery = `
        SELECT sender_id, recipient_id, subject
        FROM messages
        WHERE id = $1
      `;
      
      const parentResult = await client.query(parentQuery, [id]);
      
      if (parentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Parent message not found'
        });
      }
      
      const parentMessage = parentResult.rows[0];
      
      // Determine the recipient
      const replyRecipient = sender_id === parentMessage.sender_id 
        ? parentMessage.recipient_id 
        : parentMessage.sender_id;
      
      // Add "Re: " prefix to subject
      const replySubject = parentMessage.subject.startsWith('Re: ') 
        ? parentMessage.subject 
        : `Re: ${parentMessage.subject}`;

      await client.query('BEGIN');

      // Insert reply
      const insertQuery = `
        INSERT INTO messages (
          sender_id, recipient_id, subject, content, 
          parent_message_id, is_read, created_at
        ) VALUES ($1, $2, $3, $4, $5, false, NOW())
        RETURNING *
      `;

      const result = await client.query(insertQuery, [
        sender_id,
        replyRecipient,
        replySubject,
        content,
        id,
      ]);

      const message = result.rows[0];

      // Create notification
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
        replyRecipient,
        message.id,
        sender_id,
      ]);

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        message: 'Reply sent successfully',
        data: message
      });
    } catch (error) {
      await client.query('ROLLBACK');
      next(error);
    } finally {
      client.release();
    }
  }

  // GET /messages/search-users
  async searchUsers(req, res, next) {
    try {
      const { email } = req.query;

      if (!email || email.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Email search term must be at least 2 characters'
        });
      }

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

      const result = await pool.query(query, [`%${email}%`]);

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/user-by-email
  async getUserByEmail(req, res, next) {
    try {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

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
      const user = result.rows[0];

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'User retrieved successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
