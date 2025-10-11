const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const LessonsDTO = require("../database/models/lessonDto");

const getLessonsByUserIdAndTopic = async (req, res = response) => {
  try {
    const userId = req.params.userId;
    const topicId = req.params.topicId;

    if (!userId || !topicId) {
      return res.status(400).json({
        ok: false,
        lessons: [],
        message: "User id and topic id are required",
      });
    }

    const [lessons] = await pool.query(
      `
        SELECT 
            l.id,
            l.topic_id,
            l.title,
            l.objective,
            l.is_grammar,
            l.is_reading,
            l.is_speaking,
            l.is_listening,
            l.is_writing,
            JSON_UNQUOTE(l.grammar) AS grammar,
            JSON_UNQUOTE(l.reading) AS reading,
            JSON_UNQUOTE(l.speaking) AS speaking,
            JSON_UNQUOTE(l.listening) AS listening,
            JSON_UNQUOTE(l.writing) AS writing,
            l.created_at,
            l.updated_at,
            IFNULL(sp.progress_percent, 0) AS progress_percent
        FROM lessons l
        LEFT JOIN student_progress sp 
            ON sp.lesson_id = l.id AND sp.user_id = ?
        WHERE l.topic_id = ?
      `,
      [userId, topicId]
    );

    const lessonsDTOList = lessons.map((l) => {
      const dto = new LessonsDTO(l);
      dto.progress_percent = parseFloat(l.progress_percent);

      // Agregar status como en cursos y topics
      if (dto.progress_percent >= 100) {
        dto.status = "completed";
      } else if (dto.progress_percent > 0) {
        dto.status = "in_progress";
      } else {
        dto.status = "not_started";
      }

      return dto;
    });

    return res.json({
      ok: true,
      lessons: lessonsDTOList || [],
      message:
        lessons.length > 0
          ? "Lessons retrieved successfully"
          : "No lessons found",
    });
  } catch (error) {
    console.error("Error getting lessons data:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

module.exports = {
  getLessonsByUserIdAndTopic,
};
