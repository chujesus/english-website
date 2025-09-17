const { response } = require('express');
const jwt = require('jsonwebtoken');

/**
 * Middleware to validate JWT token in the request header.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Callback function to pass control to the next middleware.
 */
const verifyToken = (req, res = response, next) => {
    // Get the token from the request header
    const authHeader = req.header('Authorization');

    // Check if the token is missing
    if (!authHeader) {
        return res.status(401).json({ message: "Token not provided" });
    }

    // Extract token from "Bearer TOKEN" format
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    try {
        // Verify the token and extract user information
        const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
        req.user = decoded;

        // Proceed to the next middleware
        next();
    } catch (error) {
        // Handle invalid or expired tokens
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        } else {
            return res.status(401).json({ message: 'Token not valid' });
        }
    }
};

module.exports = {
    jwtValidate: verifyToken
};
