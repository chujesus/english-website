const { Router } = require("express");
const {
  getTopicById,
  getTopicsByUserIdAndCourse,
} = require("../controllers/topic");

const router = Router();

/**
 * Get topic by ID
 * @param {Object} req - Express request object with topic ID as a parameter.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the topic details.
 */
router.get("/:id", getTopicById);

/**
 * Get topics by user ID and course ID
 * @param {Object} req - Express request object with user ID and course ID as parameters.
 * @param {Object} res - Express response object.
 * @returns {Object} JSON response with the list of topics.
 */
router.get("/:userId/:courseId", getTopicsByUserIdAndCourse);

module.exports = router;
