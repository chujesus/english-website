const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const TopicDTO = require("../database/models/topicDto");

// Get all topics for a specific course (admin view)
const getTopicsByCourseAdmin = async (req, res = response) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res.status(400).json({
        ok: false,
        topics: [],
        message: "Course ID is required",
      });
    }

    const [topics] = await pool.query(
      `
      SELECT 
        t.id,
        t.course_id,
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
        COUNT(l.id) as total_lessons
      FROM topics t
      LEFT JOIN lessons l ON t.id = l.topic_id
      WHERE t.course_id = ?
      GROUP BY t.id, t.course_id, t.title, t.objective, t.examples, t.keywords, 
               t.learning_outcome, t.cefr_level, t.skills_covered, t.tags, 
               t.created_at, t.updated_at
      ORDER BY t.id
      `,
      [courseId]
    );

    const topicsList = topics.map((t) => ({
      ...new TopicDTO(t),
      total_lessons: t.total_lessons || 0,
    }));

    return res.json({
      ok: true,
      topics: topicsList,
      message:
        topics.length > 0
          ? "Topics retrieved successfully"
          : "No topics found for this course",
    });
  } catch (error) {
    console.error("Error getting topics for admin:", error);
    return res.status(500).json({
      ok: false,
      topics: [],
      message: "Internal server error",
    });
  }
};

// Create new topic
const createTopic = async (req, res = response) => {
  try {
    const {
      course_id,
      title,
      objective,
      examples,
      keywords,
      learning_outcome,
      cefr_level,
      skills_covered,
      tags,
    } = req.body;

    if (!course_id || !title || !objective) {
      return res.status(400).json({
        ok: false,
        message: "Course ID, title, and objective are required",
      });
    }

    // Validate JSON fields
    const jsonFields = { examples, keywords, skills_covered, tags };
    for (const [field, value] of Object.entries(jsonFields)) {
      if (value && typeof value !== "object") {
        try {
          JSON.parse(value);
        } catch (error) {
          return res.status(400).json({
            ok: false,
            message: `Invalid JSON format for ${field}`,
          });
        }
      }
    }

    const [result] = await pool.query(
      `INSERT INTO topics (
        course_id, title, objective, examples, keywords, learning_outcome, 
        cefr_level, skills_covered, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        course_id,
        title,
        objective,
        examples ? JSON.stringify(examples) : null,
        keywords ? JSON.stringify(keywords) : null,
        learning_outcome || null,
        cefr_level || null,
        skills_covered ? JSON.stringify(skills_covered) : null,
        tags ? JSON.stringify(tags) : null,
      ]
    );

    return res.json({
      ok: true,
      topic: {
        id: result.insertId,
        course_id,
        title,
        objective,
      },
      message: "Topic created successfully",
    });
  } catch (error) {
    console.error("Error creating topic:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Update topic
const updateTopic = async (req, res = response) => {
  try {
    const { id } = req.params;
    const {
      title,
      objective,
      examples,
      keywords,
      learning_outcome,
      cefr_level,
      skills_covered,
      tags,
    } = req.body;

    if (!title || !objective) {
      return res.status(400).json({
        ok: false,
        message: "Title and objective are required",
      });
    }

    // Validate JSON fields
    const jsonFields = { examples, keywords, skills_covered, tags };
    for (const [field, value] of Object.entries(jsonFields)) {
      if (value && typeof value !== "object") {
        try {
          JSON.parse(value);
        } catch (error) {
          return res.status(400).json({
            ok: false,
            message: `Invalid JSON format for ${field}`,
          });
        }
      }
    }

    const [result] = await pool.query(
      `UPDATE topics SET 
        title = ?, objective = ?, examples = ?, keywords = ?, 
        learning_outcome = ?, cefr_level = ?, skills_covered = ?, 
        tags = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        objective,
        examples ? JSON.stringify(examples) : null,
        keywords ? JSON.stringify(keywords) : null,
        learning_outcome || null,
        cefr_level || null,
        skills_covered ? JSON.stringify(skills_covered) : null,
        tags ? JSON.stringify(tags) : null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Topic not found",
      });
    }

    return res.json({
      ok: true,
      message: "Topic updated successfully",
    });
  } catch (error) {
    console.error("Error updating topic:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Delete topic
const deleteTopic = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Check if topic has lessons
    const [lessons] = await pool.query(
      `SELECT COUNT(*) as count FROM lessons WHERE topic_id = ?`,
      [id]
    );

    if (lessons[0].count > 0) {
      return res.status(400).json({
        ok: false,
        message:
          "Cannot delete topic that contains lessons. Delete lessons first.",
      });
    }

    const [result] = await pool.query(`DELETE FROM topics WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Topic not found",
      });
    }

    return res.json({
      ok: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting topic:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getTopicsByCourseAdmin,
  createTopic,
  updateTopic,
  deleteTopic,
};
