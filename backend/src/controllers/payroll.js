const Payroll = require('../models/Payroll');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Get payroll for a specific month
 * @route   GET /api/v1/payroll
 * @access  Private (Financier/Admin)
 */
exports.getPayroll = asyncHandler(async (req, res, next) => {
    const { month } = req.query;
    if (!month) {
        return next(new ErrorResponse('Please provide a month (YYYY-MM)', 400));
    }

    const payroll = await Payroll.findAll({ month });
    const stats = await Payroll.getStats(month);

    res.status(200).json({
        success: true,
        month,
        stats,
        data: payroll
    });
});

/**
 * @desc    Generate/Refresh payroll for a month
 * @route   POST /api/v1/payroll/generate
 * @access  Private (Financier/Admin)
 */
exports.generatePayroll = asyncHandler(async (req, res, next) => {
    const { month } = req.body;
    if (!month) {
        return next(new ErrorResponse('Please provide a month (YYYY-MM)', 400));
    }

    const data = await Payroll.generateForMonth(month);

    res.status(200).json({
        success: true,
        message: `Payroll for ${month} generated/refreshed successfully.`,
        data
    });
});

/**
 * @desc    Update payroll status (Approve/Pay)
 * @route   PUT /api/v1/payroll/:id/status
 * @access  Private (Financier/Admin)
 */
exports.updatePayrollStatus = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    const { id } = req.params;

    if (!['DRAFT', 'APPROVED', 'PAID'].includes(status)) {
        return next(new ErrorResponse('Invalid status', 400));
    }

    const paidAt = status === 'PAID' ? new Date() : null;
    const payroll = await Payroll.updateStatus(id, status, paidAt);

    if (!payroll) {
        return next(new ErrorResponse('Payroll record not found', 404));
    }

    res.status(200).json({
        success: true,
        data: payroll
    });
});
