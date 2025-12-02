const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

// Message routes
router.get('/search-users', messageController.searchUsers);
router.get('/user-by-email', messageController.getUserByEmail);
router.get('/inbox', messageController.getInbox);
router.get('/sent', messageController.getSent);
router.get('/:id', messageController.getMessage);
router.post('/send', messageController.sendMessage);
router.post('/:id/reply', messageController.replyToMessage);

module.exports = router;
