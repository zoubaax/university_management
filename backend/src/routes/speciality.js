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

router.use(protect); // All routes protected

router
    .route('/')
    .get(getSpecialities)
    .post(authorize('SUPER_ADMIN', 'RH'), createSpeciality);

router
    .route('/:id')
    .get(getSpeciality)
    .put(authorize('SUPER_ADMIN', 'RH'), updateSpeciality)
    .delete(authorize('SUPER_ADMIN', 'RH'), deleteSpeciality);

module.exports = router;
