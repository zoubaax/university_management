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

router.use(protect); // All routes protected
router.use(authorize('SUPER_ADMIN', 'RH', 'DIRECTOR_DEPARTMENT')); // Only management can manage employees

router
    .route('/')
    .get(getEmployees)
    .post(createEmployee);

router
    .route('/:id')
    .get(getEmployee)
    .put(updateEmployee)
    .delete(updateEmployee);

module.exports = router;
