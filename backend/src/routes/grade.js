const express = require('express');
const {
    getClassGrades,
    upsertGrades,
    getMyGrades
} = require('../controllers/grade');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router.post('/upsert-bulk', authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'PROFESSOR'), upsertGrades);
router.get('/class/:classId/module/:moduleId', authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'PROFESSOR'), getClassGrades);
router.get('/my-grades', authorize('STUDENT'), getMyGrades);

module.exports = router;
