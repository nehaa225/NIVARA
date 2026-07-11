const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// POST /api/chat
router.post('/', authenticateToken, chatController.handleChat);

module.exports = router;
