const express = require('express');
const {
    getAbsences,
    getAbsence,
    createAbsence,
    updateAbsence,
    deleteAbsence,
    getEmployeeAbsences
} = require('../controllers/absence');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');
const { checkResourcePermission } = require('../middlewares/rbac');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { absenceSchema } = require('../utils/validationSchemas');

// All routes require protection and 'absences' resource permission
router.use(protect);
router.use(authorize('SUPER_ADMIN', 'RH'));
router.use(checkResourcePermission('absences'));

router
    .route('/')
    .get(getAbsences)
    .post(upload.single('attachment'), validate(absenceSchema), createAbsence);

router
    .route('/:id')
    .get(getAbsence)
    .put(upload.single('attachment'), validate(absenceSchema), updateAbsence)
    .delete(deleteAbsence);

router.get('/employee/:employeeId', getEmployeeAbsences);

module.exports = router;
