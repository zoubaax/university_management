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
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER'),
        checkResourcePermission('departments'),
        validate(departmentSchema),
        createDepartment
    );

router
    .route('/:id')
    .get(getDepartment)
    .put(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER'),
        checkResourcePermission('departments'),
        validate(departmentSchema.partial()),
        updateDepartment
    )
    .delete(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER'),
        checkResourcePermission('departments'),
        deleteDepartment
    );

module.exports = router;
