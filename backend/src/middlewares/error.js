const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    // Log to console for dev
    console.error(err.stack);

    // PostgreSQL bad object ID (e.g. invalid UUID)
    if (err.code === '22P02') {
        const message = `Resource not found with id of ${err.value}`;
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

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
    });
};

module.exports = errorHandler;
