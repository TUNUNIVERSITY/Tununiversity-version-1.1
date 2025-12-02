const messageService = require('../services/message.service');

class MessageController {
  // GET /messages/inbox
  async getInbox(req, res, next) {
    try {
      const { user_id } = req.query; // In production, get from auth middleware
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
        });
      }

      const { messages, pagination } = await messageService.getInboxMessages(
        user_id,
        req.query
      );

      return res.status(200).json({
        success: true,
        message: 'Inbox messages retrieved successfully',
        data: messages,
        pagination
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/sent
  async getSent(req, res, next) {
    try {
      const { user_id } = req.query; // In production, get from auth middleware
      
      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
        });
      }

      const { messages, pagination } = await messageService.getSentMessages(
        user_id,
        req.query
      );

      return res.status(200).json({
        success: true,
        message: 'Sent messages retrieved successfully',
        data: messages,
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
      const { user_id } = req.query; // In production, get from auth middleware

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id is required'
        });
      }

      const message = await messageService.getMessageById(id, user_id);

      if (!message) {
        return res.status(404).json({
          success: false,
          message: 'Message not found'
        });
      }

      // Auto-mark as read if user is recipient
      if (message.recipient_id == user_id && !message.is_read) {
        await messageService.markAsRead(id, user_id);
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
    try {
      const { sender_id, recipient_id, subject, content, parent_message_id } = req.body;

      if (!sender_id || !recipient_id || !subject || !content) {
        return res.status(400).json({
          success: false,
          message: 'sender_id, recipient_id, subject, and content are required'
        });
      }

      const message = await messageService.sendMessage({
        sender_id,
        recipient_id,
        subject,
        content,
        parent_message_id,
      });

      return res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /messages/:id/reply
  async replyToMessage(req, res, next) {
    try {
      const { id } = req.params;
      const { sender_id, content } = req.body;

      if (!sender_id || !content) {
        return res.status(400).json({
          success: false,
          message: 'sender_id and content are required'
        });
      }

      const message = await messageService.replyToMessage(id, {
        sender_id,
        content,
      });

      return res.status(201).json({
        success: true,
        message: 'Reply sent successfully',
        data: message
      });
    } catch (error) {
      next(error);
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

      const users = await messageService.searchUsersByEmail(email);

      return res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users
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

      const user = await messageService.getUserByEmail(email);

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
