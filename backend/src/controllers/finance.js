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
