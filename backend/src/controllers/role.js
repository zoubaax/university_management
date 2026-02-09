const { query } = require('../config/db');
const ErrorResponse = require('../utils/ErrorResponse');

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private/Authenticated
exports.getRoles = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM roles ORDER BY name ASC');
        res.status(200).json({ success: true, count: result.rows.length, data: result.rows });
    } catch (err) {
        next(err);
    }
};
