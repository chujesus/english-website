const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const LessonDTO = require("../database/models/lessonDto");

// Get all lessons for a specific topic (admin view)
const getLessonsByTopicAdmin = async (req, res = response) => {
  try {
    const { topicId } = req.params;

    if (!topicId) {
      return res.status(400).json({
        ok: false,
        lessons: [],
        message: "Topic ID is required",
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
        l.content,
        JSON_UNQUOTE(l.grammar) AS grammar,
        JSON_UNQUOTE(l.reading) AS reading,
        JSON_UNQUOTE(l.speaking) AS speaking,
        JSON_UNQUOTE(l.listening) AS listening,
        JSON_UNQUOTE(l.writing) AS writing,
        l.created_at,
        l.updated_at
      FROM lessons l
      WHERE l.topic_id = ?
      ORDER BY l.id
      `,
      [topicId]
    );

    const lessonsList = lessons.map((l) => new LessonDTO(l));

    return res.json({
      ok: true,
      lessons: lessonsList,
      message:
        lessons.length > 0
          ? "Lessons retrieved successfully"
          : "No lessons found for this topic",
    });
  } catch (error) {
    console.error("Error getting lessons for admin:", error);
    return res.status(500).json({
      ok: false,
      lessons: [],
      message: "Internal server error",
    });
  }
};

// Create new lesson
const createLesson = async (req, res = response) => {
  try {
    const {
      topic_id,
      title,
      objective,
      is_grammar,
      is_reading,
      is_speaking,
      is_listening,
      is_writing,
      content,
      grammar,
      reading,
      speaking,
      listening,
      writing,
    } = req.body;

    if (!topic_id || !title || !objective) {
      return res.status(400).json({
        ok: false,
        message: "Topic ID, title, and objective are required",
      });
    }

    // Validate JSON fields (content is LONGTEXT, not JSON)
    const jsonFields = { grammar, reading, speaking, listening, writing };
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
      `INSERT INTO lessons (
        topic_id, title, objective, is_grammar, is_reading, is_speaking, 
        is_listening, is_writing, content, grammar, reading, speaking, listening, 
        writing, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        topic_id,
        title,
        objective,
        !!is_grammar,
        !!is_reading,
        !!is_speaking,
        !!is_listening,
        !!is_writing,
        content || null,
        grammar ? JSON.stringify(grammar) : null,
        reading ? JSON.stringify(reading) : null,
        speaking ? JSON.stringify(speaking) : null,
        listening ? JSON.stringify(listening) : null,
        writing ? JSON.stringify(writing) : null,
      ]
    );

    return res.json({
      ok: true,
      lesson: {
        id: result.insertId,
        topic_id,
        title,
        objective,
      },
      message: "Lesson created successfully",
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Update lesson
const updateLesson = async (req, res = response) => {
  try {
    const { id } = req.params;
    const {
      title,
      objective,
      is_grammar,
      is_reading,
      is_speaking,
      is_listening,
      is_writing,
      content,
      grammar,
      reading,
      speaking,
      listening,
      writing,
    } = req.body;

    if (!title || !objective) {
      return res.status(400).json({
        ok: false,
        message: "Title and objective are required",
      });
    }

    // Validate JSON fields (content is LONGTEXT, not JSON)
    const jsonFields = { grammar, reading, speaking, listening, writing };
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
      `UPDATE lessons SET 
        title = ?, objective = ?, is_grammar = ?, is_reading = ?, 
        is_speaking = ?, is_listening = ?, is_writing = ?, 
        content = ?, grammar = ?, reading = ?, speaking = ?, listening = ?, 
        writing = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        objective,
        !!is_grammar,
        !!is_reading,
        !!is_speaking,
        !!is_listening,
        !!is_writing,
        content || null,
        grammar ? JSON.stringify(grammar) : null,
        reading ? JSON.stringify(reading) : null,
        speaking ? JSON.stringify(speaking) : null,
        listening ? JSON.stringify(listening) : null,
        writing ? JSON.stringify(writing) : null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Lesson not found",
      });
    }

    return res.json({
      ok: true,
      message: "Lesson updated successfully",
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

// Delete lesson
const deleteLesson = async (req, res = response) => {
  try {
    const { id } = req.params;

    // First, delete related student progress
    await pool.query(`DELETE FROM student_progress WHERE lesson_id = ?`, [id]);

    // Then delete the lesson
    const [result] = await pool.query(`DELETE FROM lessons WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Lesson not found",
      });
    }

    return res.json({
      ok: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getLessonsByTopicAdmin,
  createLesson,
  updateLesson,
  deleteLesson,
};
