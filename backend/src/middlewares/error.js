const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    // Log to winston
    logger.error(`${err.message}`, {
        method: req.method,
        url: req.originalUrl,
        stack: err.stack,
        body: req.body,
        user: req.user ? req.user.id : 'Guest'
    });

    // PostgreSQL bad object ID (e.g. invalid UUID)
    if (err.code === '22P02') {
        const message = 'Resource not found: Invalid ID format';
        error = new ErrorResponse(message, 404);
    }

    // PostgreSQL duplicate key
    if (err.code === '23505') {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }

    // PostgreSQL foreign key violation
    if (err.code === '23503') {
        const message = 'Referenced resource does not exist';
        error = new ErrorResponse(message, 400);
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        error = new ErrorResponse('Invalid token', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new ErrorResponse('Token expired', 401);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
