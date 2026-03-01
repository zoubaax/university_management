const express = require('express');
const {
    getSpecialities,
    getSpeciality,
    createSpeciality,
    updateSpeciality,
    deleteSpeciality,
} = require('../controllers/speciality');
const validate = require('../middlewares/validate');
const { specialitySchema } = require('../utils/validationSchemas');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission } = require('../middlewares/rbac');

router.use(protect); // All routes protected

router
    .route('/')
    .get(getSpecialities)
    .post(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER'),
        checkResourcePermission('specialities'),
        validate(specialitySchema),
        createSpeciality
    );

router
    .route('/:id')
    .get(getSpeciality)
    .put(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER'),
        checkResourcePermission('specialities'),
        validate(specialitySchema.partial()),
        updateSpeciality
    )
    .delete(
        authorize('SUPER_ADMIN', 'RH', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT', 'FINANCIER'),
        checkResourcePermission('specialities'),
        deleteSpeciality
    );

module.exports = router;
