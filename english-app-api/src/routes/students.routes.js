const { Router } = require("express");
const { check } = require("express-validator");
const { fieldsValidates } = require("../middlewares/fields-validates");
const {
  updateStudentProgress,
  getLessonProgress,
  getTopicProgress,
} = require("../controllers/student");

const router = Router();

/**
 * @route   POST /students/progress
 * @desc    Update or create student progress and assessment
 * @access  Private
 */
router.post("/students", updateStudentProgress);

/**
 * @route   GET /students/lesson-progress/:userId/:lessonId
 * @desc    Get student progress and assessments for a specific lesson
 * @access  Private
 */
router.get("/lesson-progress/:userId/:lessonId", getLessonProgress);

/**
 * @route   GET /students/topic-progress/:userId/:topicId
 * @desc    Get student progress and assessments for all lessons in a topic
 * @access  Private
 */
router.get("/topic-progress/:userId/:topicId", getTopicProgress);

module.exports = router;
