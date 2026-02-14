const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const UserDTO = require("../database/models/userDto");

// ========================================
// USER PROFILE MANAGEMENT FUNCTIONS
// ========================================

/**
 * Get user profile by ID
 */
const getUserProfile = async (req, res = response) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `
            SELECT 
                id, identification, name, first_name, last_name, 
                phone, url_image, image_name, email, profile,
                created_at, updated_at
            FROM users 
            WHERE id = ?
        `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const user = users[0];

    return res.json({
      ok: true,
      user: {
        id: user.id,
        identification: user.identification,
        name: user.name,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        url_image: user.url_image,
        image_name: user.image_name,
        email: user.email,
        profile: user.profile,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Error getting user profile:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res = response) => {
  try {
    const { userId } = req.params;
    const {
      identification,
      name,
      first_name,
      last_name,
      phone,
      email,
      url_image,
      image_name,
    } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (existingUsers.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Update user profile
    const [result] = await pool.query(
      `
            UPDATE users SET 
                identification = ?, 
                name = ?, 
                first_name = ?, 
                last_name = ?, 
                phone = ?, 
                email = ?, 
                url_image = ?, 
                image_name = ?,
                updated_at = NOW()
            WHERE id = ?
        `,
      [
        identification,
        name,
        first_name,
        last_name,
        phone,
        email,
        url_image,
        image_name,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        ok: false,
        message: "Profile could not be updated",
      });
    }

    return res.json({
      ok: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user profile:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete profile image
 */
const deleteProfileImage = async (req, res = response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (existingUsers.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Update user to remove image
    const [result] = await pool.query(
      `
            UPDATE users SET 
                url_image = NULL, 
                image_name = NULL,
                updated_at = NOW()
            WHERE id = ?
        `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        ok: false,
        message: "Profile image could not be deleted",
      });
    }

    return res.json({
      ok: true,
      message: "Profile image deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting profile image:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// ========================================
// USER MANAGEMENT FUNCTIONS (ADMIN ONLY)
// ========================================

/**
 * Get all users
 */
const getAllUsers = async (req, res = response) => {
  try {
    const [users] = await pool.query(`
            SELECT 
                id, identification, name, first_name, last_name, 
                email, phone, profile, state, url_image, image_name,
                created_at, updated_at
            FROM users 
            ORDER BY created_at DESC
        `);

    const userDTOList = users.map((user) => new UserDTO(user));

    return res.json({
      ok: true,
      data: userDTOList,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting all users:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get user by ID (for admin management)
 */
const getUserById = async (req, res = response) => {
  try {
    const { userId } = req.params;

    const [users] = await pool.query(
      `
            SELECT 
                id, identification, name, first_name, last_name, 
                email, phone, profile, state, url_image, image_name,
                created_at, updated_at
            FROM users 
            WHERE id = ?
        `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    const userDTO = new UserDTO(users[0]);

    return res.json({
      ok: true,
      user: userDTO,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting user by ID:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update user information (admin function)
 */
const updateUser = async (req, res = response) => {
  try {
    const { userId } = req.params;
    const {
      identification,
      name,
      first_name,
      last_name,
      email,
      phone,
      profile,
      state,
    } = req.body;

    // Check if user exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE id = ?",
      [userId]
    );
    if (existingUsers.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Check if email is already used by another user
    const [emailCheck] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Email is already in use by another user",
      });
    }

    // Check if identification is already used by another user
    const [identificationCheck] = await pool.query(
      "SELECT id FROM users WHERE identification = ? AND id != ?",
      [identification, userId]
    );
    if (identificationCheck.length > 0) {
      return res.status(400).json({
        ok: false,
        message: "Identification is already in use by another user",
      });
    }

    // Update user
    const [result] = await pool.query(
      `
            UPDATE users SET 
                identification = ?, 
                name = ?, 
                first_name = ?, 
                last_name = ?, 
                email = ?, 
                phone = ?, 
                profile = ?, 
                state = ?,
                updated_at = NOW()
            WHERE id = ?
        `,
      [
        identification,
        name,
        first_name,
        last_name,
        email,
        phone,
        profile,
        state,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        ok: false,
        message: "User could not be updated",
      });
    }

    // Get updated user
    const [updatedUsers] = await pool.query(
      `
            SELECT 
                id, identification, name, first_name, last_name, 
                email, phone, profile, state, url_image, image_name,
                created_at, updated_at
            FROM users 
            WHERE id = ?
        `,
      [userId]
    );

    const userDTO = new UserDTO(updatedUsers[0]);

    return res.json({
      ok: true,
      user: userDTO,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res = response) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const [existingUsers] = await pool.query(
      "SELECT id, name FROM users WHERE id = ?",
      [userId]
    );
    if (existingUsers.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Delete user (this will cascade delete related records if properly configured)
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [
      userId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(400).json({
        ok: false,
        message: "User could not be deleted",
      });
    }

    return res.json({
      ok: true,
      message: `User "${existingUsers[0].name}" deleted successfully`,
    });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Toggle user status (activate/deactivate)
 */
const toggleUserStatus = async (req, res = response) => {
  try {
    const { userId } = req.params;
    const { state } = req.body;

    // Validate state value
    if (state !== 0 && state !== 1) {
      return res.status(400).json({
        ok: false,
        message: "Invalid state value. Must be 0 (inactive) or 1 (active)",
      });
    }

    // Check if user exists
    const [existingUsers] = await pool.query(
      "SELECT id, name, state FROM users WHERE id = ?",
      [userId]
    );
    if (existingUsers.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "User not found",
      });
    }

    // Update user status
    const [result] = await pool.query(
      `
            UPDATE users SET 
                state = ?,
                updated_at = NOW()
            WHERE id = ?
        `,
      [state, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        ok: false,
        message: "User status could not be updated",
      });
    }

    const action = state === 1 ? "activated" : "deactivated";

    return res.json({
      ok: true,
      message: `User "${existingUsers[0].name}" ${action} successfully`,
    });
  } catch (error) {
    console.error("❌ Error toggling user status:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get users by profile
 */
const getUsersByProfile = async (req, res = response) => {
  try {
    const { profile } = req.params;

    const [users] = await pool.query(
      `
            SELECT 
                id, identification, name, first_name, last_name, 
                email, phone, profile, state, url_image, image_name,
                created_at, updated_at
            FROM users 
            WHERE profile = ?
            ORDER BY created_at DESC
        `,
      [profile]
    );

    const userDTOList = users.map((user) => new UserDTO(user));

    return res.json({
      ok: true,
      data: userDTOList,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting users by profile:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get users by status
 */
const getUsersByStatus = async (req, res = response) => {
  try {
    const { state } = req.params;

    const [users] = await pool.query(
      `
            SELECT 
                id, identification, name, first_name, last_name, 
                email, phone, profile, state, url_image, image_name,
                created_at, updated_at
            FROM users 
            WHERE state = ?
            ORDER BY created_at DESC
        `,
      [state]
    );

    const userDTOList = users.map((user) => new UserDTO(user));

    return res.json({
      ok: true,
      data: userDTOList,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting users by status:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res = response) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        message: "Search query is required",
      });
    }

    const searchTerm = `%${q}%`;

    const [users] = await pool.query(
      `
            SELECT 
                id, identification, name, first_name, last_name, 
                email, phone, profile, state, url_image, image_name,
                created_at, updated_at
            FROM users 
            WHERE 
                name LIKE ? OR 
                email LIKE ? OR 
                identification LIKE ? OR 
                first_name LIKE ? OR 
                last_name LIKE ?
            ORDER BY created_at DESC
        `,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm]
    );

    const userDTOList = users.map((user) => new UserDTO(user));

    return res.json({
      ok: true,
      data: userDTOList,
      message: "Search completed successfully",
    });
  } catch (error) {
    console.error("❌ Error searching users:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get available starting modules
 */
const getAvailableModules = async (req, res = response) => {
  try {
    // Get all course modules with their levels
    const [courses] = await pool.query(`
      SELECT 
        id,
        level,
        title,
        description
      FROM courses 
      ORDER BY 
        CASE level
          WHEN 'A1' THEN 1
          WHEN 'A2' THEN 2
          WHEN 'B1' THEN 3
          WHEN 'B2' THEN 4
          ELSE 5
        END
    `);

    const modules = courses.map((course) => ({
      id: course.id,
      level: course.level,
      title: course.title,
      description: course.description,
    }));

    return res.json({
      ok: true,
      data: modules,
      message: "Available modules retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error getting available modules:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
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
};
