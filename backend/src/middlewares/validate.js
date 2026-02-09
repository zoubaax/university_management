const ErrorResponse = require('../utils/ErrorResponse');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (!error.errors) {
            console.error("Validation Error (Unknown):", error);
            return next(new ErrorResponse("Invalid input data", 400));
        }
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ErrorResponse(message, 400));
    }
};

module.exports = validate;
