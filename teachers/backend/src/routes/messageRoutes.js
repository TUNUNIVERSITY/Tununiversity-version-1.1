const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { validate } = require('../middleware/validation');
const { sendMessageSchema } = require('../validators/schemas');

// Message routes
router.get('/search-users', messageController.searchUsers);
router.get('/user-by-email', messageController.getUserByEmail);
router.get('/inbox', messageController.getInbox);
router.get('/sent', messageController.getSent);
router.get('/:id', messageController.getMessage);
router.post('/send', validate(sendMessageSchema), messageController.sendMessage);
router.post('/:id/reply', messageController.replyToMessage);

module.exports = router;
