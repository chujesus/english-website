const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');
const { getSHA256 } = require('../helpers/encrypt-password');
const { generarJWT } = require("../helpers/jwt-token");
const { getRandomSHA256, compareCrypto } = require("../helpers/encrypt-password");
const UserDTO = require('../database/models/userDto');

/**
 * Handles user authentication and login.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response.
 */
const login = async (req, res = response) => {
    try {
        // Extract email and password from the request body
        const { email, password } = req.body;

        // Retrieve user from the database based on email
        const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        // If the user is not found, return an error response
        if (user.length === 0) {
            return res.status(404).json({ ok: false, data: [], message: 'User not found' });
        }

        // Compare the provided password with the stored hash
        const validPassword = compareCrypto(password, user[0].password);

        // If the password is invalid, return an error response
        if (!validPassword) {
            return res.json({ ok: false, data: [], error: 'Invalid credentials' });
        }

        // Generate a JSON Web Token (JWT) for authentication
        const token = await generarJWT(user[0].id, user[0].name);

        // Attach the generated token to the user object
        user[0].token = token;

        // Create a user DTO instance based on the user data
        const userDto = user.map(user => new UserDTO(user));

        // Respond with the authenticated user data
        return res.json({
            data: userDto || [],
            message: 'Login successfully'
        });
    } catch (ex) {
        // Handle internal server error and return an error response
        return res.status(500).json({ ok: false, error: ex.error.message });
    }
};

/**
 * Creates a new user.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the newly created user details.
 */
const register = async (req, res = response) => {
    try {
        const userData = req.body;

        // Check if the 'password' field is present in req.body
        if (userData.password) {
            // Encrypt the password with getSHA256
            userData.password = getSHA256(userData.password);
        }

        // Generate a JSON Web Token (JWT) for authentication
        const token = await generarJWT(userData.id, userData.name);

        // Attach the generated token to the user object
        userData.token = token;

        // Use the MySQL pool to execute the query
        const [existingUser] = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [userData.email]);

        if (existingUser.length > 0) {
            return res.status(400).json({ ok: false, data: [], error: 'User already exists' });
        }     

        // Use the MySQL pool to execute the query
        const [result] = await pool.query('INSERT INTO users SET ?', [userData]);
    
        // Create a user DTO instance based on the user data
        const newUserDto = new UserDTO({ id: result.insertId, ...userData });

        return res.json({
            data: [newUserDto] || [], // Return an empty array if no user is created
            message: 'User created successfully'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};

/**
* Generate a JWT token for user authentication.
*
* @param {Request} req - Express request object.
* @param {Response} res - Express response object.
* @returns {void}
*/
const getUserToken = async (req, res = response) => {
    try {
        // Get the user ID from the request parameters
        const userId = req.params.id;

        // Retrieve the user data from the database using the user ID
        const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);

        // If the user is not found, return an error response
        if (user.length === 0) {
            return res.json({
                ok: false,
                data: [],
                error: 'User not found'
            });
        }

        // Generate a JSON Web Token (JWT) for authentication
        const token = await generarJWT(user[0].id, user[0].name);

        // Attach the generated token to the user object
        user[0].token = token;

        // Create a user DTO instance based on the user data
        const userDto = user.map(user => new UserDTO(user));

        // Respond with the generated token
        return res.json({
            data: userDto || [],
            message: 'Token generated successfully'
        });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};

/**
 * Retrieve user information based on email and password token.
 *
 * @param {*} req - The request object.
 * @param {*} res - The response object.
 */
const getPasswordToken = async (req, res = response) => {
    try {
        // Extract email and password token from request parameters
        const email = req.params.email;
        const passwordToken = req.params.token;

        // Search for a user in the database based on email and password token
        const [user] = await pool.query("SELECT * FROM users WHERE email = ? AND password_token = ?", [email, passwordToken]);

        // If the user is not found, return an error response
        if (user.length === 0) {
            return res.json({ ok: false, data: [], message: 'User not found or invalid token' });
        }

        // Create a user DTO instance based on the user data
        const userDto = user.map(user => new UserDTO(user));

        // Respond with the user data
        return res.json({
            data: userDto || [],
            message: 'Password token successfully'
        });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};


/**
 * Request password recovery for a user based on their email.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @returns {void}
 */
const recoveryPassword = async (req, res = response) => {
    try {
        const email = req.params.email;

        // Retrieve user from the database based on email
        const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

        // If the user is not found, return an error response
        if (user.length === 0) {
            return res.json({ ok: false, data: [], error: 'User not found' });
        }

        // Generate a new password token
        const passwordToken = getRandomSHA256();

        // Update password token
        user[0].password_token = passwordToken;

        // Update the user in the database with the new password token
        const [updatedUser] = await pool.query("UPDATE users SET password_token = ? WHERE id = ?", [passwordToken, user[0].id]);

        // If the user is not updated, return an error response
        if (updatedUser.affectedRows === 0) {
            return res.json({ data: [], message: 'User not updated' });
        }

        // Send a password reset email to the user with the new password token
        //await sendPasswordResetEmail(user[0]);

        // Create a user DTO instance based on the updated user data
        const userDto = user.map(user => new UserDTO(user));

        // Respond with the updated user data
        return res.json({
            data: userDto || [],
            message: 'Recovery password email successfully'
        });
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};

/**
 * Retrieves a user by their identification.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details.
 */
const getUserIdentification = async (req, res = response) => {
    try {
        const userID = req.params.identification;

        // Use the MySQL pool to execute the query
        const [user] = await pool.query("SELECT * FROM users WHERE identification = ?", [userID]);

        // Create a user DTO instance based on the user data
        const userDto = user.map(user => new UserDTO(user));

        return res.json({
            data: userDto || [], // Return an empty array if no user is found
            message: userDto ? 'User found' : 'User not found'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};

/**
 * Retrieves a user by their email.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details.
 */
const getUserEmail = async (req, res = response) => {
    try {
        const userEmail = req.params.email;

        // Use the MySQL pool to execute the query
        const [user] = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", [userEmail]);

        // Create a user DTO instance based on the user data
        const userDto = user.map(user => new UserDTO(user));

        return res.json({
            data: userDto || [], // Return an empty array if no user is found
            message: userDto ? 'User found' : 'User not found'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};

/**
 * Retrieves users by their profile.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the list of users matching the specified profile.
 */
const getUsersProfile = async (req, res = response) => {
    try {
        const userProfile = req.params.profile;

        // Use the MySQL pool to execute the query
        const [users] = await pool.query("SELECT * FROM users WHERE profile = ?", [userProfile]);

        // Create a list of UserDTO objects based on user data
        const usersDTOList = users.map(user => new UserDTO(user));

        return res.json({
            data: usersDTOList || [], // Return an empty array if no users are found
            message: usersDTOList.length > 0 ? 'Users found' : 'No users found with the specified profile'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, error: 'Internal server error' });
    }
};

module.exports = {
    login,
    register,
    getUserToken,
    getPasswordToken,
    recoveryPassword,
    getUserIdentification,
    getUserEmail,
    getUsersProfile
};