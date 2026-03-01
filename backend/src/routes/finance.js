const express = require('express');
const {
    getStats,
    getStudentProfiles,
    getPayments,
    createPayment,
    verifyPayment,
    getPartnerships,
    updateProfile
} = require('../controllers/finance');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// All routes are protected and only for FINANCIER and SUPER_ADMIN
router.use(protect);
router.use(authorize('FINANCIER', 'SUPER_ADMIN'));

router.get('/stats', getStats);
router.get('/students', getStudentProfiles);
router.get('/payments', getPayments);
router.post('/payments', createPayment);
router.put('/payments/:id/verify', verifyPayment);
router.get('/partnerships', getPartnerships);
router.put('/students/:id/profile', updateProfile);

module.exports = router;
