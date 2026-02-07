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

router.use(protect); // All routes protected

router
    .route('/')
    .get(getStudents)
    .post(authorize('SUPER_ADMIN', 'RH', 'SECRETARY'), createStudent);

router
    .route('/:id')
    .get(getStudent)
    .put(authorize('SUPER_ADMIN', 'RH', 'SECRETARY'), updateStudent)
    .delete(authorize('SUPER_ADMIN', 'RH', 'SECRETARY'), deleteStudent);

module.exports = router;
