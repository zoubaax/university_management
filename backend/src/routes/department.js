const express = require('express');
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} = require('../controllers/department');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect); // All routes protected

router
    .route('/')
    .get(getDepartments)
    .post(authorize('SUPER_ADMIN', 'RH'), createDepartment);

router
    .route('/:id')
    .get(getDepartment)
    .put(authorize('SUPER_ADMIN', 'RH'), updateDepartment)
    .delete(authorize('SUPER_ADMIN', 'RH'), deleteDepartment);

module.exports = router;
