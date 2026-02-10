const Schedule = require('../models/Schedule');
const Class = require('../models/Class');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Get schedules for a class
 * @route   GET /api/v1/schedules/class/:classId
 * @access  Private
 */
exports.getClassSchedules = async (req, res, next) => {
    try {
        const schedules = await Schedule.findAllByClass(req.params.classId);
        res.status(200).json({ success: true, count: schedules.length, data: schedules });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create or Update a schedule slot
 * @route   POST /api/v1/schedules
 * @access  Private (SuperAdmin, RespDept)
 */
exports.upsertSchedule = async (req, res, next) => {
    try {
        // Find class to check department isolation
        const academicClass = await Class.findById(req.body.class_id);
        if (!academicClass) {
            return next(new ErrorResponse('Class not found', 404));
        }

        // Department Isolation
        if ((req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT') &&
            academicClass.department_id !== req.user.department_id) {
            return next(new ErrorResponse('You can only manage schedules for your own department', 403));
        }

        const schedule = await Schedule.upsert(req.body);
        res.status(200).json({ success: true, data: schedule });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete a schedule slot
 * @route   DELETE /api/v1/schedules/:id
 * @access  Private (SuperAdmin, RespDept)
 */
exports.deleteSchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return next(new ErrorResponse('Schedule not found', 404));
        }

        // Department Isolation
        if ((req.user.role_name === 'RESPONSABLE_DEPARTMENT' || req.user.role_name === 'DIRECTOR_DEPARTMENT') &&
            schedule.department_id !== req.user.department_id) {
            return next(new ErrorResponse('You can only delete schedules for your own department', 403));
        }

        await Schedule.delete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Check room availability
 * @route   GET /api/v1/schedules/check-room?room=FSI1&day=Monday&slot=MORNING&classId=xxx
 * @access  Private
 */
exports.checkRoomAvailability = async (req, res, next) => {
    try {
        const { room, day, slot, classId } = req.query;

        if (!room || !day || !slot) {
            return next(new ErrorResponse('Room, day, and slot are required', 400));
        }

        const result = await Schedule.checkAvailability(room, day, slot, classId || null);
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};
