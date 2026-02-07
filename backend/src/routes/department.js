const express = require('express');
const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
} = require('../controllers/department');
const validate = require('../middlewares/validate');
const { departmentSchema } = require('../utils/validationSchemas');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission } = require('../middlewares/rbac');

router.use(protect);

router
    .route('/')
    .get(getDepartments)
    .post(
        authorize('RH'),
        checkResourcePermission('departments'),
        validate(departmentSchema),
        createDepartment
    );

router
    .route('/:id')
    .get(getDepartment)
    .put(
        authorize('RH'),
        checkResourcePermission('departments'),
        validate(departmentSchema),
        updateDepartment
    )
    .delete(
        authorize('RH'),
        checkResourcePermission('departments'),
        deleteDepartment
    );

module.exports = router;
