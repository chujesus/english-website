const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');
const CourseDto = require('../database/models/courseDto');

/**
 * Get all active courses (content management overview)
 * Solo devuelve cursos activos desde la BD.
 */
const getContentManagement = async (req, res = response) => {
    try {
        const [courses] = await pool.query(`
            SELECT 
                id,
                level,
                title,
                description,
                progress,
                state,
                created_at,
                updated_at
            FROM courses
            WHERE state = 1
            ORDER BY level
        `);

        const coursesDto = courses.map(c => new CourseDto(c));

        return res.json({
            ok: true,
            data: {
                courses: coursesDto
            },
            message: 'Courses retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting content management data:', error);
        return res.status(500).json({
            ok: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

/**
 * Get single course by ID
 * Retorna la información de un curso específico.
 */
const getCourseContent = async (req, res = response) => {
    try {
        const { courseId } = req.params;

        const [courseResult] = await pool.query(
            'SELECT * FROM courses WHERE id = ? AND state = 1',
            [courseId]
        );

        if (courseResult.length === 0) {
            return res.status(404).json({
                ok: false,
                data: [],
                message: 'Course not found'
            });
        }

        const course = new CourseDto(courseResult[0]);

        return res.json({
            ok: true,
            data: { course },
            message: 'Course retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting course content:', error);
        return res.status(500).json({
            ok: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

/**
 * Get all course modules
 * Retorna todos los cursos en formato de módulo (para frontend).
 */
const getCourseModules = async (req, res = response) => {
    try {
        const [courses] = await pool.query(`
            SELECT 
                id,
                level,
                title,
                description,
                progress,
                state,
                created_at,
                updated_at
            FROM courses 
            ORDER BY 
                CASE level 
                    WHEN 'A1' THEN 1 
                    WHEN 'A2' THEN 2 
                    WHEN 'B1' THEN 3 
                    WHEN 'B2' THEN 4 
                    ELSE 5 
                END
        `);

        const courseModules = courses.map(course => ({
            id: course.id,
            title: course.title,
            level: course.level,
            description: course.description,
            topics: course.progress, // progress se usa como "topics"
            status: 'not_started',   // valor default
            state: course.state,
            created_at: course.created_at,
            updated_at: course.updated_at
        }));

        return res.json({
            ok: true,
            data: courseModules,
            message: 'Course modules retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting course modules:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Error retrieving course modules'
        });
    }
};

/**
 * Bulk update course modules
 * Borra los cursos existentes e inserta los nuevos desde un JSON enviado por el frontend.
 */
const bulkUpdateCourseModules = async (req, res = response) => {
    try {
        const { courseModules } = req.body;

        if (!Array.isArray(courseModules)) {
            return res.status(400).json({
                ok: false,
                data: [],
                message: 'courseModules must be an array'
            });
        }

        await pool.query('START TRANSACTION');

        try {
            await pool.query('DELETE FROM courses');

            for (const module of courseModules) {
                const { id, title, level, description, topics, state = 1 } = module;

                if (!title || !level || !description || topics === undefined) {
                    throw new Error(`Missing required fields in module: ${JSON.stringify(module)}`);
                }

                const validLevels = ['A1', 'A2', 'B1', 'B2'];
                if (!validLevels.includes(level)) {
                    throw new Error(`Invalid level "${level}" in module: ${title}`);
                }

                if (id) {
                    await pool.query(`
                        INSERT INTO courses (id, level, title, description, progress, state) 
                        VALUES (?, ?, ?, ?, ?, ?)
                    `, [id, level, title, description, topics, state]);
                } else {
                    await pool.query(`
                        INSERT INTO courses (level, title, description, progress, state) 
                        VALUES (?, ?, ?, ?, ?)
                    `, [level, title, description, topics, state]);
                }
            }

            await pool.query('COMMIT');

            const [updatedCourses] = await pool.query(`
                SELECT 
                    id,
                    level,
                    title,
                    description,
                    progress,
                    state,
                    created_at,
                    updated_at
                FROM courses 
                ORDER BY 
                    CASE level 
                        WHEN 'A1' THEN 1 
                        WHEN 'A2' THEN 2 
                        WHEN 'B1' THEN 3 
                        WHEN 'B2' THEN 4 
                        ELSE 5 
                    END
            `);

            const courseModulesResult = updatedCourses.map(course => ({
                id: course.id,
                title: course.title,
                level: course.level,
                description: course.description,
                topics: course.progress,
                status: 'not_started',
                state: course.state,
                created_at: course.created_at,
                updated_at: course.updated_at
            }));

            return res.json({
                ok: true,
                data: courseModulesResult,
                message: 'Course modules updated successfully'
            });

        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('Error bulk updating course modules:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: `Error updating course modules: ${error.message}`
        });
    }
};

/**
 * Get courses with user progress
 * Retorna cursos junto con el progreso de un usuario específico.
 */
const getCourseModulesWithProgress = async (req, res = response) => {
  try {
    const userId = req.params.userId || req.user?.id;

    const [coursesWithProgress] = await pool.query(`
      SELECT 
        c.id,
        c.level,
        c.title,
        c.description,
        c.state,
        c.created_at,
        c.updated_at,
        COALESCE(sp.progress_percentage, 0) AS progress,
        sp.last_accessed AS lastAccessed
      FROM courses c
      LEFT JOIN student_progress sp 
        ON c.id = sp.course_id AND sp.user_id = ?
      ORDER BY 
        CASE c.level 
          WHEN 'A1' THEN 1 
          WHEN 'A2' THEN 2 
          WHEN 'B1' THEN 3 
          WHEN 'B2' THEN 4 
          ELSE 5 
        END
    `, [userId]);

    const courseModules = coursesWithProgress.map(course => {
      let status = 'not_started';
      if (course.progress > 0 && course.progress < 100) {
        status = 'in_progress';
      } else if (course.progress === 100) {
        status = 'completed';
      }

      return {
        id: course.id,
        title: course.title,
        level: course.level,
        description: course.description,
        progress: course.progress,
        lastAccessed: course.lastAccessed,
        status,
        state: course.state,
        created_at: course.created_at,
        updated_at: course.updated_at
      };
    });

    return res.json({
      ok: true,
      data: courseModules,
      message: 'Course modules with progress retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting course modules with progress:', error);
    return res.status(500).json({
      ok: false,
      data: [],
      message: 'Error retrieving course modules with progress'
    });
  }
};

module.exports = {
    getContentManagement,
    getCourseContent,
    getCourseModules,
    bulkUpdateCourseModules,
    getCourseModulesWithProgress
};
