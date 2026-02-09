const express = require('express');
const { getRoles } = require('../controllers/role');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getRoles);

module.exports = router;
