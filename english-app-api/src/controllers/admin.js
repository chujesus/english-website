const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');
const CourseDto = require('../database/models/courseDto');
const TopicDto = require('../database/models/topicDto');
const LessonDto = require('../database/models/lessonDto');

/**
 * Upload complete course content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const uploadCourseContent = async (req, res = response) => {
    try {
        const { courseId, topics, lessons } = req.body;
        const adminUserId = req.user?.id; // From JWT middleware

        if (!adminUserId) {
            return res.status(401).json({
                ok: false,
                data: [],
                message: 'Unauthorized'
            });
        }

        // Validate course exists
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

        // Create upload record
        const [uploadResult] = await pool.query(
            'INSERT INTO admin_content_uploads (admin_user_id, course_id, upload_type, status) VALUES (?, ?, ?, ?)',
            [adminUserId, courseId, 'full_course', 'processing']
        );

        const uploadId = uploadResult.insertId;

        try {
            // Start transaction
            await pool.query('START TRANSACTION');

            // Clear existing topics and lessons for course
            await pool.query('DELETE FROM lessons WHERE topic_id IN (SELECT id FROM topics WHERE course_id = ?)', [courseId]);
            await pool.query('DELETE FROM topics WHERE course_id = ?', [courseId]);

            // Insert topics
            for (const topic of topics) {
                const [topicResult] = await pool.query(`
                    INSERT INTO topics (course_id, topic_index, title, objective, keywords, examples, learning_outcome, skills_covered, tags)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    courseId,
                    topic.topic_index,
                    topic.title,
                    topic.objective,
                    JSON.stringify(topic.keywords || []),
                    JSON.stringify(topic.examples || []),
                    topic.learning_outcome,
                    JSON.stringify(topic.skills_covered || []),
                    JSON.stringify(topic.tags || [])
                ]);

                const topicId = topicResult.insertId;

                // Insert lessons for this topic
                const topicLessons = lessons.filter(lesson => lesson.topic_index === topic.topic_index);
                for (const lesson of topicLessons) {
                    await pool.query(`
                        INSERT INTO lessons (topic_id, lesson_index, content)
                        VALUES (?, ?, ?)
                    `, [topicId, lesson.lesson_index, JSON.stringify(lesson.content)]);
                }
            }

            // Commit transaction
            await pool.query('COMMIT');

            // Update upload status
            await pool.query(
                'UPDATE admin_content_uploads SET status = ? WHERE id = ?',
                ['completed', uploadId]
            );

            return res.json({
                ok: true,
                data: { upload_id: uploadId },
                message: 'Course content uploaded successfully'
            });

        } catch (error) {
            // Rollback transaction
            await pool.query('ROLLBACK');
            
            // Update upload status
            await pool.query(
                'UPDATE admin_content_uploads SET status = ?, error_message = ? WHERE id = ?',
                ['failed', error.message, uploadId]
            );

            throw error;
        }

    } catch (error) {
        console.error('Error uploading course content:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Update specific topic content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const updateTopicContent = async (req, res = response) => {
    try {
        const { topicId } = req.params;
        const { title, objective, keywords, examples, learning_outcome, skills_covered, tags } = req.body;
        const adminUserId = req.user?.id;

        if (!adminUserId) {
            return res.status(401).json({
                ok: false,
                data: [],
                message: 'Unauthorized'
            });
        }

        // Validate topic exists
        const [topicResult] = await pool.query(
            'SELECT * FROM topics WHERE id = ? AND state = 1',
            [topicId]
        );

        if (topicResult.length === 0) {
            return res.status(404).json({
                ok: false,
                data: [],
                message: 'Topic not found'
            });
        }

        // Update topic
        await pool.query(`
            UPDATE topics 
            SET title = ?, objective = ?, keywords = ?, examples = ?, 
                learning_outcome = ?, skills_covered = ?, tags = ?
            WHERE id = ?
        `, [
            title,
            objective,
            JSON.stringify(keywords || []),
            JSON.stringify(examples || []),
            learning_outcome,
            JSON.stringify(skills_covered || []),
            JSON.stringify(tags || []),
            topicId
        ]);

        return res.json({
            ok: true,
            data: [],
            message: 'Topic updated successfully'
        });

    } catch (error) {
        console.error('Error updating topic:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Upload/update lesson content for a topic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const uploadLessonContent = async (req, res = response) => {
    try {
        const { topicId } = req.params;
        const { lesson_index, content } = req.body;
        const adminUserId = req.user?.id;

        if (!adminUserId) {
            return res.status(401).json({
                ok: false,
                data: [],
                message: 'Unauthorized'
            });
        }

        // Validate topic exists
        const [topicResult] = await pool.query(
            'SELECT * FROM topics WHERE id = ? AND state = 1',
            [topicId]
        );

        if (topicResult.length === 0) {
            return res.status(404).json({
                ok: false,
                data: [],
                message: 'Topic not found'
            });
        }

        // Check if lesson exists
        const [existingLesson] = await pool.query(
            'SELECT id FROM lessons WHERE topic_id = ? AND lesson_index = ?',
            [topicId, lesson_index]
        );

        if (existingLesson.length > 0) {
            // Update existing lesson
            await pool.query(
                'UPDATE lessons SET content = ? WHERE topic_id = ? AND lesson_index = ?',
                [JSON.stringify(content), topicId, lesson_index]
            );
        } else {
            // Insert new lesson
            await pool.query(
                'INSERT INTO lessons (topic_id, lesson_index, content) VALUES (?, ?, ?)',
                [topicId, lesson_index, JSON.stringify(content)]
            );
        }

        return res.json({
            ok: true,
            data: [],
            message: 'Lesson content uploaded successfully'
        });

    } catch (error) {
        console.error('Error uploading lesson content:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Get content management overview
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getContentManagement = async (req, res = response) => {
    try {
        // Get courses with topic counts
        const [courses] = await pool.query(`
            SELECT 
                c.*,
                COUNT(t.id) as topic_count,
                COUNT(l.id) as lesson_count
            FROM courses c
            LEFT JOIN topics t ON c.id = t.course_id AND t.state = 1
            LEFT JOIN lessons l ON t.id = l.topic_id AND l.state = 1
            WHERE c.state = 1
            GROUP BY c.id
            ORDER BY c.level
        `);

        // Get recent uploads
        const [recentUploads] = await pool.query(`
            SELECT 
                acu.*,
                u.name as admin_name,
                c.title as course_title
            FROM admin_content_uploads acu
            JOIN users u ON acu.admin_user_id = u.id
            LEFT JOIN courses c ON acu.course_id = c.id
            WHERE acu.state = 1
            ORDER BY acu.created_at DESC
            LIMIT 10
        `);

        const coursesDto = courses.map(c => new CourseDto(c));

        return res.json({
            ok: true,
            data: {
                courses: coursesDto,
                recent_uploads: recentUploads
            },
            message: 'Content management data retrieved successfully'
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
 * Validate JSON structure for course content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const validateJSONStructure = async (req, res = response) => {
    try {
        const { jsonData, type } = req.body; // type: 'topic' | 'lesson'

        let validationErrors = [];

        if (type === 'topic') {
            // Validate topic structure
            const requiredFields = ['title', 'objective', 'examples', 'keywords'];
            for (const field of requiredFields) {
                if (!jsonData[field]) {
                    validationErrors.push(`Missing required field: ${field}`);
                }
            }
        } else if (type === 'lesson') {
            // Validate lesson structure
            if (!jsonData.sections || !Array.isArray(jsonData.sections)) {
                validationErrors.push('Lesson must have sections array');
            } else {
                jsonData.sections.forEach((section, index) => {
                    if (!section.title) {
                        validationErrors.push(`Section ${index} missing title`);
                    }
                    if (!section.items || !Array.isArray(section.items)) {
                        validationErrors.push(`Section ${index} missing items array`);
                    }
                });
            }
        }

        const isValid = validationErrors.length === 0;

        return res.json({
            ok: true,
            data: {
                is_valid: isValid,
                errors: validationErrors
            },
            message: isValid ? 'JSON structure is valid' : 'JSON structure validation failed'
        });

    } catch (error) {
        console.error('Error validating JSON structure:', error);
        return res.status(500).json({
            ok: false,
            data: { is_valid: false, errors: ['JSON parsing error'] },
            message: 'Error validating JSON structure'
        });
    }
};

module.exports = {
    uploadCourseContent,
    updateTopicContent,
    uploadLessonContent,
    getContentManagement,
    validateJSONStructure
};