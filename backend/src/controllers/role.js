const Role = require('../models/Role');
const { ROLES } = require('../utils/roles');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private/Authenticated
exports.getRoles = async (req, res, next) => {
    try {
        const roles = await Role.findAll();
        res.status(200).json({ success: true, count: roles.length, data: roles });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single role
// @route   GET /api/v1/roles/:id
// @access  Private/Authenticated
exports.getRole = async (req, res, next) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({ success: true, data: role });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new role
// @route   POST /api/v1/roles
// @access  Private (Super Admin)
exports.createRole = async (req, res, next) => {
    try {
        if (req.user.role_name !== ROLES.SUPER_ADMIN) {
            return next(new ErrorResponse('Not authorized to create roles', 403));
        }

        const role = await Role.create(req.body);
        res.status(201).json({ success: true, data: role });
    } catch (err) {
        next(err);
    }
};

// @desc    Update role
// @route   PUT /api/v1/roles/:id
// @access  Private (Super Admin)
exports.updateRole = async (req, res, next) => {
    try {
        if (req.user.role_name !== ROLES.SUPER_ADMIN) {
            return next(new ErrorResponse('Not authorized to update roles', 403));
        }

        const role = await Role.update(req.params.id, req.body);
        if (!role) {
            return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
        }
        res.status(200).json({ success: true, data: role });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete role
// @route   DELETE /api/v1/roles/:id
// @access  Private (Super Admin)
exports.deleteRole = async (req, res, next) => {
    try {
        if (req.user.role_name !== ROLES.SUPER_ADMIN) {
            return next(new ErrorResponse('Not authorized to delete roles', 403));
        }

        const result = await Role.delete(req.params.id);

        if (!result) {
            return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        if (err.message.includes('Cannot delete role')) {
            return next(new ErrorResponse(err.message, 400));
        }
        next(err);
    }
};
