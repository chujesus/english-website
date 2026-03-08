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

/**
 * Get all students with aggregated progress summary (admin view)
 */
const getAdminAllStudentsProgress = async (req, res = response) => {
  try {
    const [students] = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.identification,
        u.starting_module,

        COUNT(DISTINCT sp.course_id) AS courses_active,
        COUNT(sp.id) AS total_lessons_accessed,

        COALESCE(SUM(sp.is_completed),0) AS lessons_completed,

        COALESCE(ROUND(AVG(sp.progress_percent),1),0) AS avg_progress,

        MAX(sp.last_accessed) AS last_active

      FROM users u
      LEFT JOIN student_progress sp 
        ON u.id = sp.user_id

      WHERE u.profile = 1
      AND u.state = 1

      GROUP BY 
        u.id,
        u.name,
        u.email,
        u.identification,
        u.starting_module

      ORDER BY u.name ASC
    `);

    return res.status(200).json({
      ok: true,
      data: students,
      message: "Students progress summary retrieved successfully"
    });

  } catch (error) {
    console.error("Error getting admin students progress:", error);

    return res.status(500).json({
      ok: false,
      data: [],
      message: error.message
    });
  }
};

/**
 * Get detailed progress for a single student, grouped by course > topic > lesson (admin view)
 */
const getAdminStudentDetail = async (req, res = response) => {
  try {
    const { userId } = req.params;

    // Validate userId is a number to prevent injection
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({ ok: false, data: [], message: "Invalid user id" });
    }

    // 1. Verify the user exists and is a student
    const [userRows] = await pool.query(
      `SELECT id, name, email, identification, starting_module FROM users WHERE id = ? AND profile = 1`,
      [userId]
    );
    if (userRows.length === 0) {
      return res.status(404).json({ ok: false, data: {}, message: "Student not found" });
    }

    // 2. Get all progress rows for that student, joined with course/topic/lesson names
    const [rows] = await pool.query(
      `SELECT 
         sp.id          AS progress_id,
         c.id           AS course_id,
         c.title        AS course_title,
         c.level        AS course_level,
         t.id           AS topic_id,
         t.title        AS topic_title,
         l.id           AS lesson_id,
         l.title        AS lesson_title,
         sp.is_completed,
         sp.progress_percent,
         sp.last_accessed
       FROM student_progress sp
       INNER JOIN courses   c ON sp.course_id = c.id
       INNER JOIN topics    t ON sp.topic_id  = t.id
       INNER JOIN lessons   l ON sp.lesson_id = l.id
       WHERE sp.user_id = ?
       ORDER BY c.id, t.id, l.id`,
      [userId]
    );

    // 3. Build nested structure: courses -> topics -> lessons
    const coursesMap = new Map();
    for (const row of rows) {
      if (!coursesMap.has(row.course_id)) {
        coursesMap.set(row.course_id, {
          course_id: row.course_id,
          course_title: row.course_title,
          course_level: row.course_level,
          topics: new Map(),
        });
      }
      const course = coursesMap.get(row.course_id);
      if (!course.topics.has(row.topic_id)) {
        course.topics.set(row.topic_id, {
          topic_id: row.topic_id,
          topic_title: row.topic_title,
          lessons: [],
        });
      }
      course.topics.get(row.topic_id).lessons.push({
        lesson_id: row.lesson_id,
        lesson_title: row.lesson_title,
        is_completed: !!row.is_completed,
        progress_percent: row.progress_percent,
        last_accessed: row.last_accessed,
      });
    }

    // 4. Convert maps to arrays and add aggregates
    const courses = Array.from(coursesMap.values()).map((c) => {
      const topics = Array.from(c.topics.values()).map((t) => {
        const completedLessons = t.lessons.filter((l) => l.is_completed).length;
        return {
          ...t,
          total_lessons: t.lessons.length,
          completed_lessons: completedLessons,
        };
      });
      const allLessons = topics.flatMap((t) => t.lessons);
      return {
        course_id: c.course_id,
        course_title: c.course_title,
        course_level: c.course_level,
        topics,
        total_lessons: allLessons.length,
        completed_lessons: allLessons.filter((l) => l.is_completed).length,
        avg_progress: allLessons.length
          ? Math.round(allLessons.reduce((s, l) => s + (l.progress_percent || 0), 0) / allLessons.length * 10) / 10
          : 0,
      };
    });

    return res.json({
      ok: true,
      data: { student: userRows[0], courses },
      message: "Student progress detail retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting admin student detail:", error);
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
  getAdminAllStudentsProgress,
  getAdminStudentDetail,
};
