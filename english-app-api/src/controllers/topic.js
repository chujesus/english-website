const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const TopicDTO = require("../database/models/topicDto");

const getTopicById = async (req, res = response) => {
  try {
    const topicId = req.params.id;

    const [topics] = await pool.query(
      `
    SELECT 
        t.id,
        t.title,
        t.objective,
        JSON_UNQUOTE(t.examples) AS examples,
        JSON_UNQUOTE(t.keywords) AS keywords,
        t.learning_outcome,
        t.cefr_level,
        JSON_UNQUOTE(t.skills_covered) AS skills_covered,
        JSON_UNQUOTE(t.tags) AS tags,
        t.created_at,
        t.updated_at
    FROM topics t
    WHERE t.id = ?
  `,
      [topicId]
    );

    if (!topics) {
      return res.status(404).json({
        ok: false,
        message: "Topic not found",
      });
    }

    const topicDTOList = topics.map((t) => new TopicDTO(t));

    return res.json({
      ok: true,
      topics: topicDTOList || [],
      message: "Topic retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting topic data:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

const getTopicsByUserIdAndCourse = async (req, res = response) => {
  try {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    if (!userId || !courseId) {
      return res.status(400).json({
        ok: false,
        topics: [],
        message: "User id and course id are required",
      });
    }

    const [topics] = await pool.query(
      `
            SELECT
                t.id,
                t.title,
                t.objective,
                JSON_UNQUOTE(t.examples) AS examples,
                JSON_UNQUOTE(t.keywords) AS keywords,
                t.learning_outcome,
                t.cefr_level,
                JSON_UNQUOTE(t.skills_covered) AS skills_covered,
                JSON_UNQUOTE(t.tags) AS tags,
                t.created_at,
                t.updated_at,
                -- Calculate progress percent only if there are lessons
                CASE
                  WHEN (SELECT COUNT(*) FROM lessons l WHERE l.topic_id = t.id) > 0 THEN
                    ROUND(
                      (SELECT COUNT(DISTINCT sp.lesson_id)
                       FROM student_progress sp
                       WHERE sp.topic_id = t.id AND sp.user_id = ? AND sp.is_completed = 1)
                      /
                      (SELECT COUNT(*) FROM lessons l WHERE l.topic_id = t.id)
                      * 100
                      , 2)
                  ELSE 0
                END AS progress_percent,
                -- Mark completed only if all lessons are done and lessons exist
                CASE
                  WHEN (SELECT COUNT(*) FROM lessons l WHERE l.topic_id = t.id) > 0
                       AND (SELECT COUNT(DISTINCT sp.lesson_id)
                            FROM student_progress sp
                            WHERE sp.topic_id = t.id AND sp.user_id = ? AND sp.is_completed = 1)
                           = (SELECT COUNT(*) FROM lessons l WHERE l.topic_id = t.id)
                  THEN 1
                  ELSE 0
                END AS is_completed
            FROM topics t
            WHERE t.course_id = ?
        `,
      [userId, userId, courseId]
    );

    const topicsDTOList = topics.map((t) => {
      const dto = new TopicDTO(t);
      dto.progress_percent = parseFloat(t.progress_percent) || 0;
      dto.is_completed = !!t.is_completed;
      // Estatus
      if (dto.is_completed || dto.progress_percent >= 100) {
        dto.status = "completed";
      } else if (dto.progress_percent > 0 && dto.progress_percent < 100) {
        dto.status = "in_progress";
      } else {
        dto.status = "not_started";
      }
      return dto;
    });

    return res.json({
      ok: true,
      topics: topicsDTOList || [],
      message:
        topics.length > 0 ? "Topics retrieved successfully" : "No topics found",
    });
  } catch (error) {
    console.error("Error getting topics data:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

module.exports = {
  getTopicById,
  getTopicsByUserIdAndCourse,
};
