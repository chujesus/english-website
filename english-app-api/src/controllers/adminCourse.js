const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const CourseDto = require("../database/models/courseDto");

// Get all courses for admin management
const getAllCoursesAdmin = async (req, res = response) => {
  try {
    const [courses] = await pool.query(`
      SELECT 
        c.id,
        c.level,
        c.title,
        c.description,
        c.created_at,
        c.updated_at,
        COUNT(t.id) as total_topics
      FROM courses c
      LEFT JOIN topics t ON c.id = t.course_id
      GROUP BY c.id, c.level, c.title, c.description, c.created_at, c.updated_at
      ORDER BY c.id
    `);

    const coursesList = courses.map((c) => ({
      ...new CourseDto(c),
      total_topics: c.total_topics || 0,
    }));

    return res.json({
      ok: true,
      courses: coursesList,
      message:
        courses.length > 0
          ? "Courses retrieved successfully"
          : "No courses found",
    });
  } catch (error) {
    console.error("Error getting courses for admin:", error);
    return res.status(500).json({
      ok: false,
      courses: [],
      message: "Internal server error",
    });
  }
};

// Create new course
const createCourse = async (req, res = response) => {
  try {
    const { level, title, description } = req.body;

    if (!level || !title) {
      return res.status(400).json({
        ok: false,
        message: "Level and title are required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO courses (level, title, description, created_at, updated_at) 
       VALUES (?, ?, ?, NOW(), NOW())`,
      [level, title, description || null]
    );

    return res.json({
      ok: true,
      course: {
        id: result.insertId,
        level,
        title,
        description,
      },
      message: "Course created successfully",
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Update course
const updateCourse = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { level, title, description } = req.body;

    if (!level || !title) {
      return res.status(400).json({
        ok: false,
        message: "Level and title are required",
      });
    }

    const [result] = await pool.query(
      `UPDATE courses SET level = ?, title = ?, description = ?, updated_at = NOW() 
       WHERE id = ?`,
      [level, title, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Course not found",
      });
    }

    return res.json({
      ok: true,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Error updating course:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Delete course
const deleteCourse = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Check if course has topics
    const [topics] = await pool.query(
      `SELECT COUNT(*) as count FROM topics WHERE course_id = ?`,
      [id]
    );

    if (topics[0].count > 0) {
      return res.status(400).json({
        ok: false,
        message:
          "Cannot delete course that contains topics. Delete topics first.",
      });
    }

    const [result] = await pool.query(`DELETE FROM courses WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Course not found",
      });
    }

    return res.json({
      ok: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllCoursesAdmin,
  createCourse,
  updateCourse,
  deleteCourse,
};
