const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token (JWT) with the provided user ID and name.
 *
 * @param {string} userId - The user's unique identifier.
 * @param {string} userName - The user's name.
 * @returns {Promise<string>} A promise that resolves to the generated JWT token.
 */
const generarJWT = (userId, userName) => {
    return new Promise((resolve, reject) => {
        const payload = {
            userId,
            userName
        };

        // Generate the token with the payload and the secret key
        jwt.sign(payload, process.env.SECRET_JWT_KEY, {
            expiresIn: '60m' // You can adjust the token expiration as needed 1h - 1m - 10s
        }, (err, token) => {
            if (err) {
                console.error('Error generating JWT token:', err);
                reject('Unable to generate token');
            } else {
                resolve(token);
            }
        });
    });
};

module.exports = {
    generarJWT
};
