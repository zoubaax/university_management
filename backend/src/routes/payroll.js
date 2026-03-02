const express = require('express');
const {
    getPayroll,
    generatePayroll,
    updatePayrollStatus
} = require('../controllers/payroll');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Middleware protection
router.use(protect);
router.use(authorize('FINANCIER', 'SUPER_ADMIN'));

router.get('/', getPayroll);
router.post('/generate', generatePayroll);
router.put('/:id/status', updatePayrollStatus);

module.exports = router;
