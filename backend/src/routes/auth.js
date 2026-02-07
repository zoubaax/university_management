const express = require('express');
const { login, getMe, logout } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middlewares/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

module.exports = router;
