const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const CourseDto = require("../database/models/courseDto");

const getCourses = async (req, res = response) => {
  try {
    const [courses] = await pool.query("SELECT * FROM courses");

    const coursesDTOList = courses.map((c) => new CourseDto(c));

    return res.json({
      ok: true,
      courses: coursesDTOList || [],
      message:
        coursesDTOList.length > 0
          ? "Courses retrieved successfully"
          : "No courses found",
    });
  } catch (error) {
    console.error("Error getting courses data:", error);
    return res.status(500).json({
      ok: false,
      data: {},
      message: "Internal server error",
    });
  }
};

const getCoursesByUserId = async (req, res = response) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        courses: [],
        message: "User id is required",
      });
    }

    const [courses] = await pool.query(
      `
            SELECT 
                c.id,
                c.level,
                c.title,
                c.description,
                c.created_at,
                c.updated_at,
                IFNULL(AVG(sp.progress_percent), 0) AS progress_percent,
                MAX(sp.last_accessed) AS last_accessed
            FROM courses c
            LEFT JOIN student_progress sp 
                ON sp.course_id = c.id AND sp.user_id = ?
            GROUP BY c.id
        `,
      [userId]
    );

    // Pasar al DTO y agregar el campo progress
    const coursesDtoList = courses.map((c) => {
      const dto = new CourseDto(c);
      dto.progress_percent = parseFloat(c.progress_percent);

      // Estatus
      if (dto.progress_percent >= 100) {
        dto.status = "completed";
      } else if (dto.progress_percent > 0) {
        dto.status = "in_progress";
      } else {
        dto.status = "not_started";
      }
      // Último acceso (puede ser null si nunca entró)
      dto.last_accessed = c.last_accessed
        ? new Date(c.last_accessed).toISOString()
        : null;
      return dto;
    });

    return res.json({
      ok: true,
      courses: coursesDtoList || [],
      message:
        coursesDtoList.length > 0
          ? "Courses retrieved successfully"
          : "No courses found",
    });
  } catch (error) {
    console.error("Error getting courses data:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

module.exports = {
  getCourses,
  getCoursesByUserId,
};
