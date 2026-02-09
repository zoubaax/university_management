const express = require('express');
const {
    getModules,
    getModule,
    createModule,
    updateModule,
    deleteModule,
    assignToClass,
    getClassModules,
    removeFromClass
} = require('../controllers/module');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

router.use(protect);

router
    .route('/')
    .get(getModules)
    .post(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), createModule);

router
    .route('/assign')
    .post(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), assignToClass);

router
    .route('/class/:classId')
    .get(getClassModules);

router
    .route('/class/:classId/module/:moduleId')
    .delete(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), removeFromClass);

router
    .route('/:id')
    .get(getModule)
    .put(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), updateModule)
    .delete(authorize('SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT'), deleteModule);

module.exports = router;
