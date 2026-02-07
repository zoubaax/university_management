const express = require('express');
const {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
} = require('../controllers/employee');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const {
    checkRoleCreationPermission,
    checkEmployeeTypePermission,
    checkResourcePermission
} = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { employeeSchema } = require('../utils/validationSchemas');

router.use(protect);

router
    .route('/')
    .get(authorize('SUPER_ADMIN', 'RH'), getEmployees)
    .post(
        authorize('SUPER_ADMIN', 'RH'),
        validate(employeeSchema),
        (req, res, next) => {
            // If no role_id is provided, it must be a non-login employee (Cleaner/Security)
            // This is handled by checkEmployeeTypePermission
            if (req.body.role_id) {
                return checkRoleCreationPermission(req, res, next);
            }
            next();
        },
        checkEmployeeTypePermission,
        createEmployee
    );

router
    .route('/:id')
    .get(authorize('SUPER_ADMIN', 'RH'), getEmployee)
    .put(authorize('RH'), updateEmployee)
    .delete(authorize('RH'), deleteEmployee);

module.exports = router;
