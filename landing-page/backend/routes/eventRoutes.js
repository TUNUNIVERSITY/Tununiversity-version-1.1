const express = require('express');
const { getPublicEvents } = require('../controllers/eventController');

const router = express.Router();

// Public endpoint to get upcoming service events for the landing page
router.get('/', getPublicEvents);

module.exports = router;

