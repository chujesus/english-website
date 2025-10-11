const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");

/**
 * Update student progress for a course
 * Actualiza el progreso de un estudiante en un curso (no por topic, porque no existe tabla topics).
 */
const updateCourseProgress = async (req, res = response) => {
  try {
    const { userId, courseId } = req.params;
    const { status, progress_percentage } = req.body;

    // Check if progress record exists
    const [existing] = await pool.query(
      "SELECT id FROM student_progress WHERE user_id = ? AND course_id = ?",
      [userId, courseId]
    );

    if (existing.length > 0) {
      // Update existing progress
      await pool.query(
        `
                UPDATE student_progress 
                SET status = ?, progress_percentage = ?, 
                    started_at = CASE WHEN started_at IS NULL AND status != 'not_started' THEN NOW() ELSE started_at END,
                    completed_at = CASE WHEN status = 'completed' THEN NOW() ELSE completed_at END,
                    last_accessed = NOW(),
                    updated_at = NOW()
                WHERE user_id = ? AND course_id = ?
            `,
        [status, progress_percentage || 0, userId, courseId]
      );
    } else {
      // Insert new progress record
      await pool.query(
        `
                INSERT INTO student_progress (user_id, course_id, status, progress_percentage, started_at)
                VALUES (?, ?, ?, ?, CASE WHEN ? != 'not_started' THEN NOW() ELSE NULL END)
            `,
        [userId, courseId, status, progress_percentage || 0, status]
      );
    }

    return res.json({
      ok: true,
      data: [],
      message: "Progress updated successfully",
    });
  } catch (error) {
    console.error("Error updating course progress:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

module.exports = {
  updateCourseProgress,
};
