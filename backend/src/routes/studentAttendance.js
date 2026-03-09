const express = require('express');
const {
    getSessionAttendance,
    recordSessionAttendance,
    getStudentAttendance,
    getMyAttendance,
    getClassWeeklyReport,
    getAttendanceList
} = require('../controllers/studentAttendance');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.get('/my-absences', authorize('STUDENT'), getMyAttendance);

router
    .route('/')
    .get(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'RH'), getAttendanceList);

router
    .route('/session/:scheduleId')
    .get(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR'), getSessionAttendance)
    .post(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR'), recordSessionAttendance);

router
    .route('/class/:classId/report')
    .get(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'), getClassWeeklyReport);

router
    .route('/student/:studentId')
    .get(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR', 'STUDENT'), getStudentAttendance);

module.exports = router;
