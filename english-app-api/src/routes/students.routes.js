const { Router } = require("express");
const { check } = require("express-validator");
const { fieldsValidates } = require("../middlewares/fields-validates");
const { updateCourseProgress } = require("../controllers/student");

const router = Router();

/**
 * @route   PUT /:userId/course/:courseId
 * @desc    Create or update course progress for a student
 * @access  Public
 */
router.put(
  "/:userId/course/:courseId",
  [
    check("userId", "User ID is required").isNumeric(),
    check("courseId", "Course ID is required").isNumeric(),
    check("status", "Status is required")
      .isIn(["not_started", "in_progress", "completed"])
      .bail(),
    check("progress_percentage", "Progress percentage must be numeric")
      .optional()
      .isNumeric(),
    fieldsValidates,
  ],
  updateCourseProgress
);

module.exports = router;
