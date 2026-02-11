const express = require('express');
const {
    getClassResources,
    getProfessorResources,
    createResource,
    updateResource,
    deleteResource
} = require('../controllers/courseResource');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect);

router
    .route('/')
    .post(authorize('SUPER_ADMIN', 'PROFESSOR'), upload.single('resource'), createResource);

router
    .route('/:id')
    .put(authorize('SUPER_ADMIN', 'PROFESSOR'), updateResource)
    .delete(authorize('SUPER_ADMIN', 'PROFESSOR'), deleteResource);

router.get('/class/:classId', getClassResources);
router.get('/professor/:professorId', getProfessorResources);

module.exports = router;
