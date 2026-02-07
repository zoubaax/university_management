const express = require('express');
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
} = require('../controllers/student');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission, checkRoleCreationPermission } = require('../middlewares/rbac');

router.use(protect); // All routes protected

router
    .route('/')
    .get(getStudents)
    .post(
        authorize('RESPONSABLE_DEPARTMENT'),
        checkResourcePermission('students'),
        checkRoleCreationPermission,
        createStudent
    );

router
    .route('/:id')
    .get(getStudent)
    .put(authorize('RESPONSABLE_DEPARTMENT'), checkResourcePermission('students'), updateStudent)
    .delete(authorize('RESPONSABLE_DEPARTMENT'), checkResourcePermission('students'), deleteStudent);

module.exports = router;
