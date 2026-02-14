const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const { getSHA256 } = require("../helpers/encrypt-password");
const { generarJWT } = require("../helpers/jwt-token");
const {
  getRandomSHA256,
  compareCrypto,
} = require("../helpers/encrypt-password");
const { sendPasswordResetEmail } = require("../helpers/send-emails");
const UserDTO = require("../database/models/userDto");

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
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // If the user is not found, return an error response
    if (user.length === 0) {
      return res
        .status(404)
        .json({ ok: false, data: [], message: "User not found" });
    }

    // Compare the provided password with the stored hash
    const validPassword = compareCrypto(password, user[0].password);

    // If the password is invalid, return an error response
    if (!validPassword) {
      return res.json({ ok: false, data: [], error: "Invalid credentials" });
    }

    // Check if the user account is active (state = 1)
    if (user[0].state !== 1) {
      return res.status(403).json({
        ok: false,
        data: [],
        error:
          "Account is inactive. Please contact the administrator to activate your account.",
      });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = await generarJWT(user[0].id, user[0].name);

    // Attach the generated token to the user object
    user[0].token = token;

    // Create a user DTO instance based on the user data
    const userDto = user.map((user) => new UserDTO(user));

    // Respond with the authenticated user data
    return res.json({
      data: userDto || [],
      message: "Login successfully",
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

    // Validate required fields
    if (
      !userData.email ||
      !userData.password ||
      !userData.identification ||
      !userData.name
    ) {
      return res.status(400).json({
        ok: false,
        data: [],
        error:
          "Missing required fields: email, password, identification, and name are required",
      });
    }

    // Check if email already exists
    const [existingEmail] = await pool.query(
      "SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)",
      [userData.email]
    );

    if (existingEmail.length > 0) {
      return res.status(400).json({
        ok: false,
        data: [],
        error: "Email already exists",
      });
    }

    // Check if identification already exists
    const [existingId] = await pool.query(
      "SELECT id, identification FROM users WHERE identification = ?",
      [userData.identification]
    );

    if (existingId.length > 0) {
      return res.status(400).json({
        ok: false,
        data: [],
        error: "Identification already exists",
      });
    }

    // Encrypt the password
    if (userData.password) {
      userData.password = getSHA256(userData.password);
    }

    // Set default values for new users
    if (userData.state === undefined) {
      userData.state = 1; // Active by default
    }
    if (userData.profile === undefined) {
      userData.profile = 2; // Student by default
    }

    // Remove any undefined fields and prepare data for insertion
    const cleanUserData = {
      identification: userData.identification,
      name: userData.name.trim(),
      first_name: userData.first_name?.trim() || "",
      last_name: userData.last_name?.trim() || "",
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone || "",
      password: userData.password,
      state: userData.state,
      profile: userData.profile,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Insert user into database
    const [result] = await pool.query("INSERT INTO users SET ?", [
      cleanUserData,
    ]);

    if (!result.insertId) {
      return res.status(500).json({
        ok: false,
        data: [],
        error: "Failed to create user",
      });
    }

    // Generate JWT token with the new user ID
    const token = await generarJWT(result.insertId, userData.name);

    // Create user DTO with the complete data
    const newUserData = {
      id: result.insertId,
      ...cleanUserData,
      token: token,
    };

    const newUserDto = new UserDTO(newUserData);

    return res.json({
      ok: true,
      data: [newUserDto],
      message: "User created successfully",
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      error: "Internal server error",
    });
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
    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    // If the user is not found, return an error response
    if (user.length === 0) {
      return res.json({
        ok: false,
        data: [],
        error: "User not found",
      });
    }

    // Check if the user account is active (state = 1)
    if (user[0].state !== 1) {
      return res.status(403).json({
        ok: false,
        data: [],
        error: "Account is inactive. Cannot generate token for inactive users.",
      });
    }

    // Generate a JSON Web Token (JWT) for authentication
    const token = await generarJWT(user[0].id, user[0].name);

    // Attach the generated token to the user object
    user[0].token = token;

    // Create a user DTO instance based on the user data
    const userDto = user.map((user) => new UserDTO(user));

    // Respond with the generated token
    return res.json({
      data: userDto || [],
      message: "Token generated successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ ok: false, error: "Internal server error" });
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
    const [user] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND password_token = ?",
      [email, passwordToken]
    );

    // If the user is not found, return an error response
    if (user.length === 0) {
      return res.json({
        ok: false,
        data: [],
        message: "User not found or invalid token",
      });
    }

    // Create a user DTO instance based on the user data
    const userDto = user.map((user) => new UserDTO(user));

    // Respond with the user data
    return res.json({
      data: userDto || [],
      message: "Password token successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ ok: false, error: "Internal server error" });
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
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // If the user is not found, return an error response
    if (user.length === 0) {
      return res.json({ ok: false, data: [], error: "User not found" });
    }

    // Generate a new password token
    const passwordToken = getRandomSHA256();

    // Update password token
    user[0].password_token = passwordToken;

    // Update the user in the database with the new password token
    const [updatedUser] = await pool.query(
      "UPDATE users SET password_token = ? WHERE id = ?",
      [passwordToken, user[0].id]
    );

    // If the user is not updated, return an error response
    if (updatedUser.affectedRows === 0) {
      return res.json({ data: [], message: "User not updated" });
    }

    // Send a password reset email to the user with the new password token
    await sendPasswordResetEmail(user[0]);

    // Create a user DTO instance based on the updated user data
    const userDto = user.map((user) => new UserDTO(user));

    // Respond with the updated user data
    return res.json({
      ok: true,
      data: userDto || [],
      message: "Recovery password email successfully",
    });
  } catch (error) {
    // Handle any errors that occur during the process
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

/**
 * Retrieves a specific user by their ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details.
 */
const getUser = async (req, res = response) => {
  try {
    const userId = req.params.id;

    // Use the MySQL pool to execute the query
    const [user] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    // Create a user DTO instance based on the user data
    const userDto = user.map((user) => new UserDTO(user));

    return res.json({
      data: userDto || [], // Return an empty array if no user is found
      message: userDto ? "User found" : "User not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
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
    const [user] = await pool.query(
      "SELECT * FROM users WHERE identification = ?",
      [userID]
    );

    // Create a user DTO instance based on the user data
    const userDto = user.map((user) => new UserDTO(user));

    return res.json({
      data: userDto || [], // Return an empty array if no user is found
      message: userDto ? "User found" : "User not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
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
    const [user] = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
      [userEmail]
    );

    // Create a user DTO instance based on the user data
    const userDto = user.map((user) => new UserDTO(user));

    return res.json({
      data: userDto || [], // Return an empty array if no user is found
      message: userDto ? "User found" : "User not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
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
    const [users] = await pool.query("SELECT * FROM users WHERE profile = ?", [
      userProfile,
    ]);

    // Create a list of UserDTO objects based on user data
    const usersDTOList = users.map((user) => new UserDTO(user));

    return res.json({
      data: usersDTOList || [], // Return an empty array if no users are found
      message:
        usersDTOList.length > 0
          ? "Users found"
          : "No users found with the specified profile",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

/**
 * Updates a user's information by their ID.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the updated user details.
 */
const updateUser = async (req, res = response) => {
  try {
    const userId = req.params.id;
    const userData = req.body;

    // Find the existing user by their ID
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (existingUser.length === 0) {
      return res.json({ ok: false, data: [], error: "User not found" });
    }

    // Check if the 'password' field is present in req.body
    if (userData.password) {
      // Encrypt the password with getSHA256
      userData.password = getSHA256(userData.password);
    }

    // Use the MySQL pool to execute the query
    const [updatedUser] = await pool.query("UPDATE users SET ? WHERE id = ?", [
      userData,
      userId,
    ]);

    if (updatedUser.affectedRows === 0) {
      return res.json({
        data: [], // Return an empty array if the user is not found
        message: "User not found",
      });
    }

    // Get updated user
    const [user] = await pool.query(
      `
            SELECT *
            FROM users 
            WHERE id = ?
        `,
      [userId]
    );

    // Create a user DTO instance based on the user data
    const updatedUserDto = user.map((user) => new UserDTO(user));

    return res.json({
      data: updatedUserDto || [], // Return an empty array if no user is found
      message: updatedUserDto ? "User updated successfully" : "User not found",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Internal server error" });
  }
};

module.exports = {
  login,
  register,
  getUserToken,
  updateUser,
  getPasswordToken,
  recoveryPassword,
  getUser,
  getUserIdentification,
  getUserEmail,
  getUsersProfile,
};
