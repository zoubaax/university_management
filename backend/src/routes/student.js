const express = require('express');
const {
    getStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent,
} = require('../controllers/student');
const upload = require('../middlewares/upload');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission, checkRoleCreationPermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { studentSchema } = require('../utils/validationSchemas');

router.use(protect); // All routes protected

const studentUpload = upload.fields([
    { name: 'bac_document', maxCount: 1 },
    { name: 'cin_document', maxCount: 1 }
]);

router
    .route('/')
    .get(getStudents)
    .post(
        authorize('RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'RH'),
        checkResourcePermission('students'),
        studentUpload,
        validate(studentSchema),
        checkRoleCreationPermission,
        createStudent
    );

router
    .route('/:id')
    .get(getStudent)
    .put(
        authorize('RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'RH'),
        checkResourcePermission('students'),
        studentUpload,
        updateStudent
    )
    .delete(
        authorize('RESPONSABLE_DEPARTMENT', 'SUPER_ADMIN', 'RH'),
        checkResourcePermission('students'),
        deleteStudent
    );

module.exports = router;
