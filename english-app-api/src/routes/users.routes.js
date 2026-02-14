const { Router } = require("express");
const {
  // Profile functions
  getUserProfile,
  updateUserProfile,
  deleteProfileImage,

  // User management functions (admin)
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUsersByProfile,
  getUsersByStatus,
  searchUsers,
  getAvailableModules,
} = require("../controllers/users");

const router = Router();

// ========================================
// USER PROFILE ROUTES
// ========================================

/**
 * @route   GET /profile/:userId
 * @desc    Get user profile by ID
 * @access  Private
 */
router.get("/profile/:userId", getUserProfile);

/**
 * @route   PUT /profile/:userId
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile/:userId", updateUserProfile);

/**
 * @route   DELETE /profile-image/:userId
 * @desc    Delete user profile image (set URL to null)
 * @access  Private
 */
router.delete("/profile-image/:userId", deleteProfileImage);

// ========================================
// USER MANAGEMENT ROUTES (ADMIN ONLY)
// ========================================

/**
 * @route   GET /all
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get("/all", getAllUsers);

/**
 * @route   GET /search
 * @desc    Search users
 * @access  Private (Admin only)
 */
router.get("/search", searchUsers);

/**
 * @route   GET /available-modules
 * @desc    Get available starting modules
 * @access  Private (Admin only)
 */
router.get("/available-modules", getAvailableModules);

/**
 * @route   GET /profile-filter/:profile
 * @desc    Get users by profile
 * @access  Private (Admin only)
 */
router.get("/profile-filter/:profile", getUsersByProfile);

/**
 * @route   GET /status/:state
 * @desc    Get users by status
 * @access  Private (Admin only)
 */
router.get("/status/:state", getUsersByStatus);

/**
 * @route   GET /:userId
 * @desc    Get user by ID (admin function)
 * @access  Private (Admin only)
 */
router.get("/:userId", getUserById);

/**
 * @route   PUT /:userId
 * @desc    Update user information (admin function)
 * @access  Private (Admin only)
 */
router.put("/:userId", updateUser);

/**
 * @route   PATCH /:userId/status
 * @desc    Toggle user status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.patch("/:userId/status", toggleUserStatus);

/**
 * @route   DELETE /:userId
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete("/:userId", deleteUser);

module.exports = router;
