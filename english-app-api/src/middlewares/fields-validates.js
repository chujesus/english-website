const { response } = require('express');
const { validationResult } = require('express-validator');

/**
 * Middleware to validate request fields using express-validator.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Callback function to pass control to the next middleware.
 * @returns {void}
 */
const fieldsValidates = (req, res = response, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errors.mapped()
        });
    }

    // Proceed to the next middleware
    next();
}

module.exports = {
    fieldsValidates
}
