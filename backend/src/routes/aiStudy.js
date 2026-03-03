const express = require('express');
const router = express.Router();
const { generateQuizFromResource, saveQuizResult, getStudyHistory } = require('../controllers/aiStudy');
const { protect } = require('../middlewares/auth');

router.post('/generate-quiz/:resourceId', protect, generateQuizFromResource);
router.post('/save-result', protect, saveQuizResult);
router.get('/history', protect, getStudyHistory);

module.exports = router;
