const DepartmentService = require('../services/departmentService');

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
    try {
        const departments = await DepartmentService.getAllDepartments();
        res.status(200).json({ success: true, count: departments.length, data: departments });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single department
// @route   GET /api/v1/departments/:id
// @access  Private
exports.getDepartment = async (req, res, next) => {
    try {
        const department = await DepartmentService.getDepartmentById(req.params.id);
        res.status(200).json({ success: true, data: department });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new department
// @route   POST /api/v1/departments
// @access  Private/Admin
exports.createDepartment = async (req, res, next) => {
    try {
        const department = await DepartmentService.createDepartment(req.body);
        res.status(201).json({ success: true, data: department });
    } catch (err) {
        next(err);
    }
};

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res, next) => {
    try {
        const department = await DepartmentService.updateDepartment(req.params.id, req.body);
        res.status(200).json({ success: true, data: department });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete department
// @route   DELETE /api/v1/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res, next) => {
    try {
        await DepartmentService.deleteDepartment(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
