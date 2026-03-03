const express = require('express');
const {
    getClassSchedules,
    getProfessorSchedules,
    upsertSchedule,
    deleteSchedule,
    checkRoomAvailability,
    generateSchedule
} = require('../controllers/schedule');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/class/:classId', getClassSchedules);
router.get('/professor/:professorId', getProfessorSchedules);
router.get('/check-room', checkRoomAvailability);

router.use(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'));

router.post('/', upsertSchedule);
router.post('/generate/:classId', generateSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;
