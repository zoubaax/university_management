const ErrorResponse = require('../utils/ErrorResponse');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        const message = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new ErrorResponse(message, 400));
    }
};

module.exports = validate;
