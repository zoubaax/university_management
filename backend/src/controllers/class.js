const ClassService = require('../services/classService');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all classes
// @route   GET /api/v1/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
    try {
        const classes = await ClassService.getAllClasses(req.user);
        res.status(200).json({
            success: true,
            count: classes.length,
            data: classes
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single class
// @route   GET /api/v1/classes/:id
// @access  Private
exports.getClass = async (req, res, next) => {
    try {
        const classObj = await ClassService.getClassById(req.params.id, req.user);
        res.status(200).json({
            success: true,
            data: classObj
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new class
// @route   POST /api/v1/classes
// @access  Private (SUPER_ADMIN, RH, RESPONSABLE_DEPARTMENT)
exports.createClass = async (req, res, next) => {
    try {
        const classObj = await ClassService.createClass(req.body, req.user);
        res.status(201).json({
            success: true,
            data: classObj
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Update class
// @route   PUT /api/v1/classes/:id
// @access  Private (SUPER_ADMIN, RH, RESPONSABLE_DEPARTMENT)
exports.updateClass = async (req, res, next) => {
    try {
        const classObj = await ClassService.updateClass(req.params.id, req.body, req.user);
        res.status(200).json({
            success: true,
            data: classObj
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete class
// @route   DELETE /api/v1/classes/:id
// @access  Private (SUPER_ADMIN, RH, RESPONSABLE_DEPARTMENT)
exports.deleteClass = async (req, res, next) => {
    try {
        await ClassService.deleteClass(req.params.id, req.user);
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        next(err);
    }
};
