const express = require('express');
const { getRoles, getRole, createRole, updateRole, deleteRole } = require('../controllers/role');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getRoles)
    .post(authorize('SUPER_ADMIN'), createRole);

router.route('/:id')
    .get(getRole)
    .put(authorize('SUPER_ADMIN'), updateRole)
    .delete(authorize('SUPER_ADMIN'), deleteRole);

module.exports = router;
