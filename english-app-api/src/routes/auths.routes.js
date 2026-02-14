const { Router } = require("express");
const { check } = require("express-validator");
const {
  login,
  register,
  getUser,
  getUserIdentification,
  getUserEmail,
  getUsersProfile,
  getUserToken,
  getPasswordToken,
  recoveryPassword,
  updateUser,
} = require("../controllers/auth");

const router = Router();

/**
 * Log in user.
 *
 * @param {Object} req - Express request object with user credentials in the request body.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details and authentication token.
 */
router.post(
  "/login",
  [
    check("email", "The email is required").isEmail(),
    check("password", "The password is required").isLength({ min: 6 }),
  ],
  login
);

/**
 * Create a new user.
 *
 * @param {Object} req - Express request object with user data in the request body.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the newly created user details.
 */
router.post("/register", register);

/**
 * Get a user by their ID.
 *
 * @param {Object} req - Express request object with the user ID as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details.
 */
router.get("/:id", getUser);

/**
 * Get a user by their identification number.
 *
 * @param {Object} req - Express request object with the user identification number as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details.
 */
router.get("/identification/:identification", getUserIdentification);

/**
 * Get a user by their email.
 *
 * @param {Object} req - Express request object with the user email as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the user details.
 */
router.get("/email/:email", getUserEmail);

/**
 * Get a user by their profile type.
 *
 * @param {Object} req - Express request object with the user profile type as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the list of users matching the profile type.
 */
router.get("/profile/:profile", getUsersProfile);

/**
 * Get authentication token by user ID.
 *
 * @param {Object} req - Express request object with the user ID as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the authentication token.
 */
router.get("/generate-jwt/:id", getUserToken);

/**
 * Get password reset token for a user by email and token.
 *
 * @param {Object} req - Express request object with email and token as parameters.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response indicating success or failure of token retrieval.
 */
router.get(
  "/password-token/:email/:token",
  [check("email", "The email is required").isEmail()],
  getPasswordToken
);

/**
 * Initiate password recovery for a user by email.
 *
 * @param {Object} req - Express request object with email as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response indicating success or failure of password recovery initiation.
 */
router.get(
  "/recovery-password/:email",
  [check("email", "The email is required").isEmail()],
  recoveryPassword
);

/**
 * Update a user by their ID.
 *
 * @param {Object} req - Express request object with the user ID and updated data in the request body.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the updated user details.
 */
router.put("/:id", updateUser);

module.exports = router;
