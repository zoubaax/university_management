const Finance = require('../models/Finance');
const { query } = require('../config/db');

// @desc    Get finance overview stats
// @route   GET /api/v1/finance/stats
// @access  Private (Financier/Admin)
exports.getStats = async (req, res, next) => {
    try {
        const stats = await Finance.getStats();
        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all student finance profiles
// @route   GET /api/v1/finance/students
// @access  Private (Financier/Admin)
exports.getStudentProfiles = async (req, res, next) => {
    try {
        const filters = {
            hasDebt: req.query.hasDebt === 'true'
        };
        const profiles = await Finance.getStudentProfiles(filters);
        res.status(200).json({ success: true, count: profiles.length, data: profiles });
    } catch (err) {
        next(err);
    }
};

// @desc    Get recent payments
// @route   GET /api/v1/finance/payments
// @access  Private (Financier/Admin)
exports.getPayments = async (req, res, next) => {
    try {
        const result = await query(`
            SELECT 
                fp.*, 
                s.first_name as student_first_name, 
                s.last_name as student_last_name
            FROM finance_payments fp
            JOIN students s ON fp.student_id = s.id
            ORDER BY fp.created_at DESC
            LIMIT 50
        `);
        res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// @desc    Record a new payment
// @route   POST /api/v1/finance/payments
// @access  Private (Financier/Admin)
exports.createPayment = async (req, res, next) => {
    try {
        const paymentData = {
            ...req.body,
            verified_by: req.user.id
        };
        const payment = await Finance.createPayment(paymentData);

        // Notify Student
        try {
            const Notification = require('../models/Notification');
            const studentRes = await query('SELECT user_id, first_name FROM students WHERE id = $1', [req.body.student_id]);
            if (studentRes.rows[0]) {
                await Notification.create({
                    user_id: studentRes.rows[0].user_id,
                    type: 'general',
                    title: 'Payment Recorded',
                    message: `A payment of ${req.body.amount} MAD has been recorded to your account via ${req.body.payment_method}.`,
                    link: '/finance'
                });
            }
        } catch (warn) {
            console.warn('Notification failed:', warn.message);
        }

        res.status(201).json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

// @desc    Verify a payment (Check/Transfer)
// @route   PUT /api/v1/finance/payments/:id/verify
// @access  Private (Financier/Admin)
exports.verifyPayment = async (req, res, next) => {
    try {
        const payment = await Finance.verifyPayment(req.params.id, req.user.id);

        // Notify Student
        try {
            const Notification = require('../models/Notification');
            const studentRes = await query('SELECT user_id FROM students WHERE id = $1', [payment.student_id]);
            if (studentRes.rows[0]) {
                await Notification.create({
                    user_id: studentRes.rows[0].user_id,
                    type: 'general',
                    title: 'Payment Verified',
                    message: `Your payment of ${payment.amount} MAD has been verified.`,
                    link: '/finance'
                });
            }
        } catch (warn) {
            console.warn('Notification failed:', warn.message);
        }

        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all partnerships
// @route   GET /api/v1/finance/partnerships
// @access  Private (Financier/Admin)
exports.getPartnerships = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM partnerships WHERE is_active = TRUE ORDER BY company_name');
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        next(err);
    }
};

// @desc    Update student finance profile (plan/partner)
// @route   PUT /api/v1/finance/students/:id/profile
// @access  Private (Financier/Admin)
exports.updateProfile = async (req, res, next) => {
    try {
        const { payment_plan, partnership_id } = req.body;
        const profile = await Finance.updateFinanceProfile(req.params.id, payment_plan, partnership_id);
        res.status(200).json({ success: true, data: profile });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new partnership
// @route   POST /api/v1/finance/partnerships
// @access  Private (Financier/Admin)
exports.createPartnership = async (req, res, next) => {
    try {
        const partnership = await Finance.createPartnership(req.body);
        res.status(201).json({ success: true, data: partnership });
    } catch (err) {
        next(err);
    }
};
