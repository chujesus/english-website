const { response } = require("express");
const { pool } = require("../database/db-connection/mySqlDbConnection");
const StudentProgressDTO = require("../database/models/studentProgressDto");
const AssessmentDTO = require("../database/models/assessmentDto");

/**
 * Update student progress and assessment
 * Actualiza o crea el progreso de un estudiante y su evaluación (assessment) asociada.
 */
const updateStudentProgress = async (req, res = response) => {
  try {
    const {
      user_id,
      course_id,
      topic_id,
      lesson_id,
      is_completed,
      progress_percent,
      assessment,
    } = req.body;

    // ============================================================
    // 1. Verificar si ya existe el registro en student_progress
    // ============================================================
    const [existingProgress] = await pool.query(
      `SELECT id 
         FROM student_progress 
        WHERE user_id = ? 
          AND course_id = ? 
          AND topic_id = ? 
          AND lesson_id = ?`,
      [user_id, course_id, topic_id, lesson_id]
    );

    let studentProgressId;

    if (existingProgress.length > 0) {
      // ============================================================
      // 2. Actualizar progreso existente
      // ============================================================
      studentProgressId = existingProgress[0].id;
      await pool.query(
        `
          UPDATE student_progress 
             SET is_completed = ?, 
                 progress_percent = ?, 
                 last_accessed = NOW(),
                 updated_at = NOW()
           WHERE id = ?
        `,
        [is_completed ? 1 : 0, progress_percent || 0, studentProgressId]
      );
    } else {
      // ============================================================
      // 3. Insertar nuevo registro de progreso
      // ============================================================
      const [insertResult] = await pool.query(
        `
          INSERT INTO student_progress 
            (user_id, course_id, topic_id, lesson_id, is_completed, progress_percent, last_accessed)
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `,
        [
          user_id,
          course_id,
          topic_id,
          lesson_id,
          is_completed ? 1 : 0,
          progress_percent || 0,
        ]
      );
      studentProgressId = insertResult.insertId;
    }

    // ============================================================
    // 4. Insertar o actualizar assessment asociado (si existe)
    // ============================================================
    if (assessment) {
      const [existingAssessment] = await pool.query(
        `SELECT id 
           FROM assessments 
          WHERE student_progress_id = ? 
            AND user_id = ? 
            AND type = ?`,
        [studentProgressId, user_id, assessment.type]
      );

      if (existingAssessment.length > 0) {
        // Actualizar assessment existente
        await pool.query(
          `
            UPDATE assessments 
               SET practice_answered = ?, 
                   score = ?, 
                   feedback = ?, 
                   updated_at = NOW()
             WHERE id = ?
          `,
          [
            JSON.stringify(assessment.practice_answered || []),
            assessment.score || 0,
            assessment.feedback || null,
            existingAssessment[0].id,
          ]
        );
      } else {
        // Crear nuevo assessment
        await pool.query(
          `
            INSERT INTO assessments 
              (user_id, student_progress_id, type, practice_answered, score, feedback)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            user_id,
            studentProgressId,
            assessment.type,
            JSON.stringify(assessment.practice_answered || []),
            assessment.score || 0,
            assessment.feedback || null,
          ]
        );
      }
    }

    // ============================================================
    // 5. Respuesta final
    // ============================================================
    return res.json({
      ok: true,
      data: { student_progress_id: studentProgressId },
      message: "Student progress and assessment updated successfully",
    });
  } catch (error) {
    console.error("Error updating student progress:", error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: "Internal server error",
    });
  }
};

const getLessonProgress = async (req, res = response) => {
  try {
    const { userId, lessonId } = req.params;

    // 1️⃣ Obtener progreso del estudiante en la lección
    const [progressResults] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        course_id,
        topic_id,
        lesson_id,
        is_completed,
        progress_percent,
        last_accessed,
        created_at,
        updated_at
      FROM student_progress
      WHERE user_id = ? AND lesson_id = ?
      `,
      [userId, lessonId]
    );

    if (progressResults.length === 0) {
      return res.json({
        ok: true,
        data: [],
        message: "No progress found for this lesson",
      });
    }

    const progressDTO = new StudentProgressDTO(progressResults[0]);

    // 2️⃣ Obtener assessments relacionados a este progreso
    const [assessmentsDTO] = await pool.query(
      `
      SELECT 
        id,
        user_id,
        student_progress_id,
        type,
        JSON_UNQUOTE(practice_answered) AS practice_answered,
        score,
        feedback,
        created_at,
        updated_at
      FROM assessments
      WHERE student_progress_id = ? AND user_id = ?
      ORDER BY created_at DESC
      `,
      [progressDTO.id, userId]
    );

    // 3️⃣ Responder con DTOs formateados
    return res.json({
      ok: true,
      data: { progress: progressDTO, assessments: assessmentsDTO } || [],
      message: "Lesson progress retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting lesson progress:", error);
    return res.status(500).json({
      ok: false,
      data: {},
      message: "Internal server error",
    });
  }
};

const getTopicProgress = async (req, res = response) => {
  try {
    const { userId, topicId } = req.params;

    // Obtener todos los assessments del usuario para este tópico
    const [assessments] = await pool.query(
      `
      SELECT 
        a.id,
        a.user_id,
        a.student_progress_id,
        a.type,
        JSON_UNQUOTE(a.practice_answered) AS practice_answered,
        a.score,
        a.feedback,
        a.created_at,
        a.updated_at,
        sp.lesson_id,
        sp.topic_id,
        sp.course_id
      FROM assessments a
      INNER JOIN student_progress sp ON a.student_progress_id = sp.id
      WHERE a.user_id = ? AND sp.topic_id = ?
      ORDER BY sp.lesson_id, a.type
      `,
      [userId, topicId]
    );

    return res.json({
      ok: true,
      data: { assessments: assessments } || [],
      message: "Topic progress retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting topic progress:", error);
    return res.status(500).json({
      ok: false,
      data: {},
      message: "Internal server error",
    });
  }
};

module.exports = {
  updateStudentProgress,
  getLessonProgress,
  getTopicProgress,
};
