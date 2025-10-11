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
                JSON_UNQUOTE(t.examples) as examples,
                JSON_UNQUOTE(t.keywords) as keywords,
                t.learning_outcome,
                t.cefr_level,
                JSON_UNQUOTE(t.skills_covered) as skills_covered,
                JSON_UNQUOTE(t.tags) as tags,
                t.created_at,
                t.updated_at,
                IFNULL(AVG(sp.progress_percent), 0) AS progress_percent
            FROM topics t
            LEFT JOIN student_progress sp 
                ON sp.topic_id = t.id AND sp.user_id = ?
            WHERE t.course_id = ?
            GROUP BY t.id
        `,
      [userId, courseId]
    );

    const topicsDTOList = topics.map((t) => {
      const dto = new TopicDTO(t);
      dto.progress_percent = parseFloat(t.progress_percent);
      // Estatus
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
