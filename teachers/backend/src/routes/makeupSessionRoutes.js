const express = require('express');
const router = express.Router();
const makeupSessionController = require('../controllers/makeupSessionController');
const { validate } = require('../middleware/validation');
const { createMakeupSessionSchema } = require('../validators/schemas');

// Make-up session routes
router.post('/', validate(createMakeupSessionSchema), makeupSessionController.createMakeupSession);

module.exports = router;
