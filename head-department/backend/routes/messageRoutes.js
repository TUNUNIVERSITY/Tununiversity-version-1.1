const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

// Message routes
router.get('/search-users', messageController.searchUsers.bind(messageController));
router.get('/user-by-email', messageController.getUserByEmail.bind(messageController));
router.get('/inbox', messageController.getInbox.bind(messageController));
router.get('/sent', messageController.getSent.bind(messageController));
router.get('/:id', messageController.getMessage.bind(messageController));
router.post('/send', messageController.sendMessage.bind(messageController));
router.post('/:id/reply', messageController.replyToMessage.bind(messageController));

module.exports = router;
