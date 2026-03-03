const express = require('express');
const router = express.Router();
const { generateQuizFromResource } = require('../controllers/aiStudy');
const { protect } = require('../middlewares/auth');

router.post('/generate-quiz/:resourceId', protect, generateQuizFromResource);

module.exports = router;
