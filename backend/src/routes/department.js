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
const { checkResourcePermission } = require('../middlewares/rbac');

router.use(protect); // All routes protected

router
    .route('/')
    .get(getDepartments)
    .post(authorize('RH'), checkResourcePermission('departments'), createDepartment);

router
    .route('/:id')
    .get(getDepartment)
    .put(authorize('RH'), checkResourcePermission('departments'), updateDepartment)
    .delete(authorize('RH'), checkResourcePermission('departments'), deleteDepartment);

module.exports = router;
