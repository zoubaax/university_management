const AbsenceService = require('../services/absenceService');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all absences
// @route   GET /api/v1/absences
// @access  Private (RH, SUPER_ADMIN)
exports.getAbsences = async (req, res, next) => {
    try {
        const absences = await AbsenceService.getAllAbsences();
        res.status(200).json({
            success: true,
            count: absences.length,
            data: absences
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single absence
// @route   GET /api/v1/absences/:id
// @access  Private (RH, SUPER_ADMIN)
exports.getAbsence = async (req, res, next) => {
    try {
        const absence = await AbsenceService.getAbsenceById(req.params.id);
        res.status(200).json({
            success: true,
            data: absence
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new absence record
// @route   POST /api/v1/absences
// @access  Private (RH, SUPER_ADMIN)
exports.createAbsence = async (req, res, next) => {
    try {
        // Add the user who recorded this
        req.body.recorded_by = req.user.id;

        if (req.file) {
            req.body.attachment_url = `/uploads/absences/${req.file.filename}`;
        }

        const absence = await AbsenceService.createAbsence(req.body);

        // NOTIFICATION LOGIC
        try {
            const Notification = require('../models/Notification');
            const { query } = require('../config/db');

            // Find Employee's User ID
            const result = await query(
                `SELECT user_id FROM employees WHERE id = $1`,
                [req.body.employee_id]
            );
            const userId = result.rows[0]?.user_id;

            if (userId) {
                await Notification.create({
                    user_id: userId,
                    type: 'general',
                    title: 'Absence Recorded',
                    message: `An absence has been recorded for you from ${req.body.start_date} to ${req.body.end_date}`,
                    link: '/profile',
                    related_id: absence.id
                });
            }
        } catch (error) {
            console.error('Notification error:', error);
        }

        res.status(201).json({
            success: true,
            data: absence
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update absence record
// @route   PUT /api/v1/absences/:id
// @access  Private (RH, SUPER_ADMIN)
exports.updateAbsence = async (req, res, next) => {
    try {
        if (req.file) {
            req.body.attachment_url = `/uploads/absences/${req.file.filename}`;
        }
        const absence = await AbsenceService.updateAbsence(req.params.id, req.body);
        res.status(200).json({
            success: true,
            data: absence
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete absence record
// @route   DELETE /api/v1/absences/:id
// @access  Private (RH, SUPER_ADMIN)
exports.deleteAbsence = async (req, res, next) => {
    try {
        await AbsenceService.deleteAbsence(req.params.id);
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get absences for a specific employee
// @route   GET /api/v1/absences/employee/:employeeId
// @access  Private (RH, SUPER_ADMIN)
exports.getEmployeeAbsences = async (req, res, next) => {
    try {
        const absences = await AbsenceService.getEmployeeAbsences(req.params.employeeId);
        res.status(200).json({
            success: true,
            count: absences.length,
            data: absences
        });
    } catch (err) {
        next(err);
    }
};
