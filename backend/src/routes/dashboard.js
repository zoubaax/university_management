const express = require('express');
const { getAdminStats } = require('../controllers/dashboard');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/admin-stats', authorize('SUPER_ADMIN'), getAdminStats);

module.exports = router;
