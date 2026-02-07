const express = require('express');
const {
    getSpecialities,
    getSpeciality,
    createSpeciality,
    updateSpeciality,
    deleteSpeciality,
} = require('../controllers/speciality');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission } = require('../middlewares/rbac');

router.use(protect); // All routes protected

router
    .route('/')
    .get(getSpecialities)
    .post(authorize('RESPONSABLE_DEPARTMENT'), checkResourcePermission('specialities'), createSpeciality);

router
    .route('/:id')
    .get(getSpeciality)
    .put(authorize('RESPONSABLE_DEPARTMENT'), checkResourcePermission('specialities'), updateSpeciality)
    .delete(authorize('RESPONSABLE_DEPARTMENT'), checkResourcePermission('specialities'), deleteSpeciality);

module.exports = router;
