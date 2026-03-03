const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/aiAssistant');
const { protect } = require('../middlewares/auth');

router.post('/chat', protect, chatWithAssistant);

module.exports = router;
