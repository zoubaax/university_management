const { query } = require('../config/db');
const { canCreateRole, ROLES } = require('../utils/roles');

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private/Authenticated
exports.getRoles = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM roles ORDER BY name ASC');
        let roles = result.rows;

        // If not super admin, filter roles the user can actually create
        if (req.user.role_name !== ROLES.SUPER_ADMIN) {
            roles = roles.filter(role => canCreateRole(req.user.role_name, role.name));
        }

        res.status(200).json({ success: true, count: roles.length, data: roles });
    } catch (err) {
        next(err);
    }
};
