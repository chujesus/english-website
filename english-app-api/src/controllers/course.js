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

    // Obtener todos los cursos con información básica
    const [courses] = await pool.query(
      `
            SELECT 
                c.id,
                c.level,
                c.title,
                c.description,
                c.created_at,
                c.updated_at
            FROM courses c
            ORDER BY c.id
        `
    );

    // Para cada curso, calcular el progreso basado en tópicos completados
    const coursesDtoList = await Promise.all(
      courses.map(async (course) => {
        const dto = new CourseDto(course);

        // Obtener el total de tópicos del curso
        const [totalTopicsResult] = await pool.query(
          `SELECT COUNT(*) as total_topics FROM topics WHERE course_id = ?`,
          [course.id]
        );
        const totalTopics = totalTopicsResult[0]?.total_topics || 0;

        // Obtener tópicos completados por el usuario
        const [completedTopicsResult] = await pool.query(
          `
                    SELECT COUNT(DISTINCT sp.topic_id) as completed_topics
                    FROM student_progress sp
                    WHERE sp.course_id = ? AND sp.user_id = ? AND sp.is_completed = 1
                `,
          [course.id, userId]
        );
        const completedTopics = completedTopicsResult[0]?.completed_topics || 0;

        // Calcular progreso: (tópicos completados / total tópicos) * 100
        let progressPercent = 0;
        if (totalTopics > 0) {
          progressPercent = Math.round((completedTopics / totalTopics) * 100);
        }

        dto.progress_percent = progressPercent;

        // Calcular estatus basado en el progreso
        if (dto.progress_percent >= 100) {
          dto.status = "completed";
        } else if (dto.progress_percent > 0) {
          dto.status = "in_progress";
        } else {
          dto.status = "not_started";
        }

        // Obtener último acceso
        const [lastAccessResult] = await pool.query(
          `
                    SELECT MAX(sp.last_accessed) as last_accessed
                    FROM student_progress sp
                    WHERE sp.course_id = ? AND sp.user_id = ?
                `,
          [course.id, userId]
        );

        dto.lastAccessed = lastAccessResult[0]?.last_accessed
          ? new Date(lastAccessResult[0].last_accessed).toISOString()
          : null;
        return dto;
      })
    );

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
