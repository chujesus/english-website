const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');

/**
 * Get all course modules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with course modules
 */
const getCourseModules = async (req, res = response) => {
    try {
        // Get all courses to transform them into CourseModule format
        const [courses] = await pool.query(`
            SELECT 
                id,
                level,
                title,
                description,
                progress as topics,
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

        // Transform to CourseModule format
        const courseModules = courses.map(course => ({
            id: course.id,
            title: course.title,
            level: course.level,
            description: course.description,
            topics: course.topics,
            status: 'not_started', // Default status, can be enhanced with user progress
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

const getCourseModulesWithProgress = async (req, res = response) => {
  try {
    const userId = req.params.userId || req.user?.id; // asegúrate de obtener el id del usuario

    // Get courses with user progress
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

    // Transform to CourseModule format with progress
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
        updated_at: course.updated_at,
        topics: [] // opcional, si luego quieres llenar con otra query
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

/**
 * Create a new course module
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const createCourseModule = async (req, res = response) => {
    try {
        const { title, level, description, topics } = req.body;

        // Validate required fields
        if (!title || !level || !description || !topics) {
            return res.status(400).json({
                ok: false,
                data: [],
                message: 'All fields are required: title, level, description, topics'
            });
        }

        // Validate level
        const validLevels = ['A1', 'A2', 'B1', 'B2'];
        if (!validLevels.includes(level)) {
            return res.status(400).json({
                ok: false,
                data: [],
                message: 'Invalid level. Must be A1, A2, B1, or B2'
            });
        }

        // Insert new course
        const [result] = await pool.query(`
            INSERT INTO courses (level, title, description, progress, state) 
            VALUES (?, ?, ?, ?, 1)
        `, [level, title, description, topics]);

        // Get the created course
        const [newCourse] = await pool.query(`
            SELECT 
                id,
                level,
                title,
                description,
                progress as topics,
                state,
                created_at,
                updated_at
            FROM courses 
            WHERE id = ?
        `, [result.insertId]);

        const courseModule = {
            id: newCourse[0].id,
            title: newCourse[0].title,
            level: newCourse[0].level,
            description: newCourse[0].description,
            topics: newCourse[0].topics,
            status: 'not_started',
            state: newCourse[0].state,
            created_at: newCourse[0].created_at,
            updated_at: newCourse[0].updated_at
        };

        return res.status(201).json({
            ok: true,
            data: courseModule,
            message: 'Course module created successfully'
        });
    } catch (error) {
        console.error('Error creating course module:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Error creating course module'
        });
    }
};

/**
 * Update course module
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const updateCourseModule = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { title, level, description, topics, state } = req.body;

        // Check if course exists
        const [existingCourse] = await pool.query('SELECT id FROM courses WHERE id = ?', [id]);
        if (existingCourse.length === 0) {
            return res.status(404).json({
                ok: false,
                data: [],
                message: 'Course module not found'
            });
        }

        // Validate level if provided
        if (level) {
            const validLevels = ['A1', 'A2', 'B1', 'B2'];
            if (!validLevels.includes(level)) {
                return res.status(400).json({
                    ok: false,
                    data: [],
                    message: 'Invalid level. Must be A1, A2, B1, or B2'
                });
            }
        }

        // Build update query dynamically
        const updateFields = [];
        const updateValues = [];
        
        if (title) {
            updateFields.push('title = ?');
            updateValues.push(title);
        }
        if (level) {
            updateFields.push('level = ?');
            updateValues.push(level);
        }
        if (description) {
            updateFields.push('description = ?');
            updateValues.push(description);
        }
        if (topics) {
            updateFields.push('progress = ?');
            updateValues.push(topics);
        }
        if (state !== undefined) {
            updateFields.push('state = ?');
            updateValues.push(state);
        }

        updateFields.push('updated_at = NOW()');
        updateValues.push(id);

        // Update course
        await pool.query(`
            UPDATE courses 
            SET ${updateFields.join(', ')}
            WHERE id = ?
        `, updateValues);

        // Get updated course
        const [updatedCourse] = await pool.query(`
            SELECT 
                id,
                level,
                title,
                description,
                progress as topics,
                state,
                created_at,
                updated_at
            FROM courses 
            WHERE id = ?
        `, [id]);

        const courseModule = {
            id: updatedCourse[0].id,
            title: updatedCourse[0].title,
            level: updatedCourse[0].level,
            description: updatedCourse[0].description,
            topics: updatedCourse[0].topics,
            status: 'not_started',
            state: updatedCourse[0].state,
            created_at: updatedCourse[0].created_at,
            updated_at: updatedCourse[0].updated_at
        };

        return res.json({
            ok: true,
            data: courseModule,
            message: 'Course module updated successfully'
        });
    } catch (error) {
        console.error('Error updating course module:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Error updating course module'
        });
    }
};

/**
 * Delete course module
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const deleteCourseModule = async (req, res = response) => {
    try {
        const { id } = req.params;

        // Check if course exists
        const [existingCourse] = await pool.query('SELECT id FROM courses WHERE id = ?', [id]);
        if (existingCourse.length === 0) {
            return res.status(404).json({
                ok: false,
                data: [],
                message: 'Course module not found'
            });
        }

        // Delete course (this will cascade delete related data)
        await pool.query('DELETE FROM courses WHERE id = ?', [id]);

        return res.json({
            ok: true,
            data: [],
            message: 'Course module deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course module:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Error deleting course module'
        });
    }
};

/**
 * Bulk update course modules (for JSON editor)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
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

        // Start transaction
        await pool.query('START TRANSACTION');

        try {
            // Clear existing courses
            await pool.query('DELETE FROM courses');

            // Insert new courses
            for (const module of courseModules) {
                const { id, title, level, description, topics, state = 1 } = module;
                
                // Validate required fields
                if (!title || !level || !description || topics === undefined) {
                    throw new Error(`Missing required fields in module: ${JSON.stringify(module)}`);
                }

                // Validate level
                const validLevels = ['A1', 'A2', 'B1', 'B2'];
                if (!validLevels.includes(level)) {
                    throw new Error(`Invalid level "${level}" in module: ${title}`);
                }

                // Insert with specific ID if provided, otherwise auto-increment
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

            // Commit transaction
            await pool.query('COMMIT');

            // Get updated course modules
            const [updatedCourses] = await pool.query(`
                SELECT 
                    id,
                    level,
                    title,
                    description,
                    progress as topics,
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
                topics: course.topics,
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
            // Rollback transaction
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

module.exports = {
    getCourseModules,
    getCourseModulesWithProgress,
    createCourseModule,
    updateCourseModule,
    deleteCourseModule,
    bulkUpdateCourseModules
};