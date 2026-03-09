const ErrorResponse = require('../utils/ErrorResponse');
const { canCreateRole, canManageResource, ROLES } = require('../utils/roles');
const { query } = require('../config/db');

/**
 * Middleware to check if user has permission to manage a specific resource
 */
exports.checkResourcePermission = (resource) => {
    return (req, res, next) => {
        const userPermissions = req.user.permissions || [];
        const userRole = req.user.role_name;

        // SUPER_ADMIN always has access
        if (userRole === ROLES.SUPER_ADMIN) {
            return next();
        }

        // Mapping resource names to actual permission strings
        const resourceToPermission = {
            'students': 'manage_students',
            'employees': 'manage_staff',
            'departments': 'manage_departments',
            'specialities': 'manage_specialities',
            'classes': 'manage_classes',
            'absences': 'manage_absences',
            'modules': 'manage_modules',
            'rooms': 'manage_rooms',
            'schedules': 'manage_schedules',
            'grades': 'manage_grades',
            'cafeteria': 'manage_cafeteria'
        };

        const requiredPermission = resourceToPermission[resource];

        // 1. Try dynamic permission check
        if (requiredPermission && userPermissions.includes(requiredPermission)) {
            return next();
        }

        // 2. Fallback to hardcoded permissions for roles that might not have dynamic permissions yet
        // This ensures existing functionality doesn't break for students/professors
        if (canManageResource(userRole, resource)) {
            return next();
        }

        return next(
            new ErrorResponse(
                `User does not have the required permission (${requiredPermission || resource}) to access this resource`,
                403
            )
        );
    };
};

/**
 * Middleware to check if user can create a user with a specific role
 * The target role ID must be in req.body.role_id
 */
exports.checkRoleCreationPermission = async (req, res, next) => {
    // SUPER_ADMIN can create any role (except maybe themselves, but we allow it for now)
    if (req.user.role_name === ROLES.SUPER_ADMIN) {
        return next();
    }

    const { role_id } = req.body;

    if (!role_id) {
        return next(new ErrorResponse('role_id is required', 400));
    }

    try {
        // Fetch the name of the target role
        const result = await query('SELECT name FROM roles WHERE id = $1', [role_id]);
        if (result.rows.length === 0) {
            return next(new ErrorResponse('Target role does not exist', 404));
        }

        const targetRoleName = result.rows[0].name;

        if (!canCreateRole(req.user.role_name, targetRoleName)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role_name} is not authorized to create a user with role ${targetRoleName}`,
                    403
                )
            );
        }

        next();
    } catch (err) {
        next(err);
    }
};

/**
 * Specifically for RH creating cleaners/security who have NO login account
 */
exports.checkEmployeeTypePermission = (req, res, next) => {
    const { type } = req.body;

    // SUPER_ADMIN can create any type of employee (specifically for RH creation)
    if (req.user.role_name === ROLES.SUPER_ADMIN) {
        return next();
    }

    if (req.user.role_name === ROLES.RH) {
        const allowedTypes = ['CLEANER', 'SECURITY', 'PROFESSOR', 'ADMINISTRATIVE'];
        if (!allowedTypes.includes(type)) {
            return next(new ErrorResponse(`RH cannot create employee of type ${type}`, 403));
        }
    } else {
        return next(new ErrorResponse(`Only RH can manage general employees`, 403));
    }

    next();
};
