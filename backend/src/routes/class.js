const express = require('express');
const {
    getClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass
} = require('../controllers/class');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const { classSchema } = require('../utils/validationSchemas');

router.use(protect);

router
    .route('/')
    .get(getClasses)
    .post(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT'),
        checkResourcePermission('classes'),
        validate(classSchema),
        createClass
    );

router
    .route('/:id')
    .get(getClass)
    .put(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT'),
        checkResourcePermission('classes'),
        validate(classSchema),
        updateClass
    )
    .delete(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT'),
        checkResourcePermission('classes'),
        deleteClass
    );

module.exports = router;
