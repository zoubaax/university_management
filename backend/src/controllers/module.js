const Module = require('../models/Module');
const ErrorResponse = require('../utils/ErrorResponse');

/**
 * @desc    Get all modules
 * @route   GET /api/v1/modules
 * @access  Private
 */
exports.getModules = async (req, res, next) => {
    try {
        const modules = await Module.findAll();
        res.status(200).json({ success: true, count: modules.length, data: modules });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get single module
 * @route   GET /api/v1/modules/:id
 * @access  Private
 */
exports.getModule = async (req, res, next) => {
    try {
        const module = await Module.findById(req.params.id);
        if (!module) {
            return next(new ErrorResponse('Module not found', 404));
        }
        res.status(200).json({ success: true, data: module });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Create new module
 * @route   POST /api/v1/modules
 * @access  Private (SuperAdmin, RespDept)
 */
exports.createModule = async (req, res, next) => {
    try {
        const module = await Module.create(req.body);
        res.status(201).json({ success: true, data: module });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Update module
 * @route   PUT /api/v1/modules/:id
 * @access  Private (SuperAdmin, RespDept)
 */
exports.updateModule = async (req, res, next) => {
    try {
        const module = await Module.update(req.params.id, req.body);
        if (!module) {
            return next(new ErrorResponse('Module not found', 404));
        }
        res.status(200).json({ success: true, data: module });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Delete module
 * @route   DELETE /api/v1/modules/:id
 * @access  Private (SuperAdmin, RespDept)
 */
exports.deleteModule = async (req, res, next) => {
    try {
        const module = await Module.softDelete(req.params.id);
        if (!module) {
            return next(new ErrorResponse('Module not found', 404));
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Assign module to class with professor
 * @route   POST /api/v1/modules/assign
 * @access  Private (SuperAdmin, RespDept)
 */
exports.assignToClass = async (req, res, next) => {
    try {
        const assignment = await Module.assignToClass(req.body);
        res.status(201).json({ success: true, data: assignment });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get modules assigned to a class
 * @route   GET /api/v1/modules/class/:classId
 * @access  Private
 */
exports.getClassModules = async (req, res, next) => {
    try {
        const modules = await Module.getClassModules(req.params.classId);
        res.status(200).json({ success: true, count: modules.length, data: modules });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Remove module from class
 * @route   DELETE /api/v1/modules/class/:classId/module/:moduleId
 * @access  Private (SuperAdmin, RespDept)
 */
exports.removeFromClass = async (req, res, next) => {
    try {
        await Module.removeFromClass(req.params.classId, req.params.moduleId);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
