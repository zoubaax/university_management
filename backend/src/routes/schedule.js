const express = require('express');
const {
    getClassSchedules,
    upsertSchedule,
    deleteSchedule
} = require('../controllers/schedule');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.get('/class/:classId', getClassSchedules);

router.use(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'));

router.post('/', upsertSchedule);
router.delete('/:id', deleteSchedule);

module.exports = router;
