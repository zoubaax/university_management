const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        // Set token from cookie
        token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse('User no longer exists', 401));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role_name)) {
            return next(
                new ErrorResponse(
                    `User role ${req.user.role_name} is not authorized to access this route`,
                    403
                )
            );
        }
        next();
    };
};
