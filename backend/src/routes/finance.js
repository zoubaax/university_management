const express = require('express');
const {
    getStats,
    getDashboardStats,
    getStudentProfiles,
    getPayments,
    createPayment,
    verifyPayment,
    getPartnerships,
    createPartnership,
    updateProfile,
    getPaymentReceipt,
    getMyPayments
} = require('../controllers/finance');

const router = express.Router();

const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// Stats, Payments, and Profiles are strictly for Financiers and Super Admins
router.get('/stats', authorize('FINANCIER', 'SUPER_ADMIN'), getStats);
router.get('/dashboard', authorize('FINANCIER', 'SUPER_ADMIN'), getDashboardStats);
router.get('/students', authorize('FINANCIER', 'SUPER_ADMIN'), getStudentProfiles);
router.get('/payments', authorize('FINANCIER', 'SUPER_ADMIN'), getPayments);
router.post('/payments', authorize('FINANCIER', 'SUPER_ADMIN'), createPayment);
router.put('/payments/:id/verify', authorize('FINANCIER', 'SUPER_ADMIN'), verifyPayment);
router.get('/payments/:id/receipt', authorize('FINANCIER', 'SUPER_ADMIN', 'STUDENT'), getPaymentReceipt);
router.get('/my-payments', authorize('STUDENT'), getMyPayments);
router.put('/students/:id/profile', authorize('FINANCIER', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'), updateProfile);

// Partnerships list: Accessible by Managers/Dept Heads for student linking/enrollment
router.get('/partnerships', authorize('FINANCIER', 'SUPER_ADMIN', 'RESPONSABLE_DEPARTMENT', 'DIRECTOR_DEPARTMENT'), getPartnerships);
router.post('/partnerships', authorize('FINANCIER', 'SUPER_ADMIN'), createPartnership);

module.exports = router;
