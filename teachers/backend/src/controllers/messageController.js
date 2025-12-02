const messageService = require('../services/messageService');
const ResponseHandler = require('../utils/responseHandler');

class MessageController {
  // GET /messages/inbox
  async getInbox(req, res, next) {
    try {
      const { teacher_id } = req.query; // In production, get from auth middleware
      
      if (!teacher_id) {
        return ResponseHandler.error(res, 'teacher_id is required', 400);
      }

      const { messages, pagination } = await messageService.getInboxMessages(
        teacher_id,
        req.query
      );

      return ResponseHandler.paginated(
        res,
        messages,
        pagination,
        'Inbox messages retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/sent
  async getSent(req, res, next) {
    try {
      const { teacher_id } = req.query; // In production, get from auth middleware
      
      if (!teacher_id) {
        return ResponseHandler.error(res, 'teacher_id is required', 400);
      }

      const { messages, pagination } = await messageService.getSentMessages(
        teacher_id,
        req.query
      );

      return ResponseHandler.paginated(
        res,
        messages,
        pagination,
        'Sent messages retrieved successfully'
      );
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
        return ResponseHandler.error(res, 'user_id is required', 400);
      }

      const message = await messageService.getMessageById(id, user_id);

      if (!message) {
        return ResponseHandler.error(res, 'Message not found', 404);
      }

      // Auto-mark as read if user is recipient
      if (message.recipient_id == user_id && !message.is_read) {
        await messageService.markAsRead(id, user_id);
        message.is_read = true;
        message.read_at = new Date();
      }

      return ResponseHandler.success(
        res,
        message,
        'Message retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /messages/send
  async sendMessage(req, res, next) {
    try {
      const { sender_id, recipient_id, subject, content, parent_message_id } = req.body;

      const message = await messageService.sendMessage({
        sender_id,
        recipient_id,
        subject,
        content,
        parent_message_id,
      });

      return ResponseHandler.success(
        res,
        message,
        'Message sent successfully',
        201
      );
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
        return ResponseHandler.error(res, 'sender_id and content are required', 400);
      }

      const message = await messageService.replyToMessage(id, {
        sender_id,
        content,
      });

      return ResponseHandler.success(
        res,
        message,
        'Reply sent successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/search-users
  async searchUsers(req, res, next) {
    try {
      const { email } = req.query;

      if (!email || email.length < 2) {
        return ResponseHandler.error(res, 'Email search term must be at least 2 characters', 400);
      }

      const users = await messageService.searchUsersByEmail(email);

      return ResponseHandler.success(
        res,
        users,
        'Users retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /messages/user-by-email
  async getUserByEmail(req, res, next) {
    try {
      const { email } = req.query;

      if (!email) {
        return ResponseHandler.error(res, 'Email is required', 400);
      }

      const user = await messageService.getUserByEmail(email);

      if (!user) {
        return ResponseHandler.error(res, 'User not found', 404);
      }

      return ResponseHandler.success(
        res,
        user,
        'User retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessageController();
