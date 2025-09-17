const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');
const StudentProgressDto = require('../database/models/studentProgressDto');
const PracticeAttemptDto = require('../database/models/practiceAttemptDto');

/**
 * Get student progress for all courses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with student progress
 */
const getStudentProgress = async (req, res = response) => {
    try {
        const { userId } = req.params;
        const { courseId } = req.query; // Agregar soporte para filtro por curso

        let query = `
            SELECT 
                sp.*, 
                c.title as course_title, 
                c.level as course_level,
                t.title as topic_title,
                COUNT(pa.id) as practices_completed
            FROM student_progress sp
            JOIN courses c ON sp.course_id = c.id
            JOIN topics t ON sp.topic_id = t.id
            LEFT JOIN practice_attempts pa ON sp.topic_id = pa.topic_id AND sp.user_id = pa.user_id
            WHERE sp.user_id = ? AND sp.state = 1
        `;

        const params = [userId];

        // Si se especifica courseId, filtrar por curso
        if (courseId) {
            query += ' AND sp.course_id = ?';
            params.push(courseId);
        }

        query += ' GROUP BY sp.id ORDER BY c.level, t.topic_index';

        const [progress] = await pool.query(query, params);

        const progressDto = progress.map(p => new StudentProgressDto(p));

        return res.json({
            ok: true,
            data: progressDto,
            message: 'Student progress retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting student progress:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Get topic-specific progress for a student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with topic progress
 */
const getTopicProgress = async (req, res = response) => {
    try {
        const { userId, topicId } = req.params;

        // Get progress
        const progressQuery = `
            SELECT 
                sp.*, 
                c.title as course_title, 
                c.level as course_level,
                t.title as topic_title
            FROM student_progress sp
            JOIN courses c ON sp.course_id = c.id
            JOIN topics t ON sp.topic_id = t.id
            WHERE sp.user_id = ? AND sp.topic_id = ? AND sp.state = 1
        `;

        // Get practice attempts
        const practicesQuery = `
            SELECT * FROM practice_attempts 
            WHERE user_id = ? AND topic_id = ? AND state = 1
            ORDER BY practice_type, section_index
        `;

        const [progressResult] = await pool.query(progressQuery, [userId, topicId]);
        const [practicesResult] = await pool.query(practicesQuery, [userId, topicId]);

        const progress = progressResult.length > 0 ? new StudentProgressDto(progressResult[0]) : null;
        const practices = practicesResult.map(p => new PracticeAttemptDto(p));

        return res.json({
            ok: true,
            data: {
                progress,
                practices,
                total_practices: practices.length
            },
            message: 'Topic progress retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting topic progress:', error);
        return res.status(500).json({
            ok: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

/**
 * Update topic progress status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const updateTopicProgress = async (req, res = response) => {
    try {
        const { userId, topicId } = req.params;
        const { status, progress_percentage } = req.body;

        // Check if progress record exists
        const [existing] = await pool.query(
            'SELECT id FROM student_progress WHERE user_id = ? AND topic_id = ?',
            [userId, topicId]
        );

        let query;
        let params;

        if (existing.length > 0) {
            // Update existing progress
            query = `
                UPDATE student_progress 
                SET status = ?, progress_percentage = ?, 
                    started_at = CASE WHEN started_at IS NULL AND status != 'not_started' THEN NOW() ELSE started_at END,
                    completed_at = CASE WHEN status = 'completed' THEN NOW() ELSE NULL END,
                    last_accessed = NOW()
                WHERE user_id = ? AND topic_id = ?
            `;
            params = [status, progress_percentage || 0, userId, topicId];
        } else {
            // Get course_id for the topic
            const [topicResult] = await pool.query('SELECT course_id FROM topics WHERE id = ?', [topicId]);
            if (topicResult.length === 0) {
                return res.status(404).json({
                    ok: false,
                    data: [],
                    message: 'Topic not found'
                });
            }

            // Insert new progress record
            query = `
                INSERT INTO student_progress (user_id, course_id, topic_id, status, progress_percentage, started_at)
                VALUES (?, ?, ?, ?, ?, CASE WHEN ? != 'not_started' THEN NOW() ELSE NULL END)
            `;
            params = [userId, topicResult[0].course_id, topicId, status, progress_percentage || 0, status];
        }

        await pool.query(query, params);

        return res.json({
            ok: true,
            data: [],
            message: 'Progress updated successfully'
        });

    } catch (error) {
        console.error('Error updating topic progress:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Get student dashboard data with overview of all courses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with dashboard data
 */
const getStudentDashboard = async (req, res = response) => {
    try {
        const { userId } = req.params;

        const query = `
            SELECT 
                c.id as course_id,
                c.level,
                c.title as course_title,
                c.progress,
                COUNT(sp.id) as topics_started,
                SUM(CASE WHEN sp.status = 'completed' THEN 1 ELSE 0 END) as topics_completed,
                AVG(sp.progress_percentage) as avg_progress,
                MAX(sp.last_accessed) as last_activity
            FROM courses c
            LEFT JOIN topics t ON c.id = t.course_id AND t.state = 1
            LEFT JOIN student_progress sp ON t.id = sp.topic_id AND sp.user_id = ? AND sp.state = 1
            WHERE c.state = 1
            GROUP BY c.id
            ORDER BY c.level
        `;

        const [dashboard] = await pool.query(query, [userId]);

        const dashboardData = dashboard.map(item => ({
            course_id: item.course_id,
            level: item.level,
            course_title: item.course_title,
            progress: item.progress,
            topics_started: item.topics_started || 0,
            topics_completed: item.topics_completed || 0,
            progress_percentage: Math.round(item.avg_progress || 0),
            last_activity: item.last_activity
        }));

        return res.json({
            ok: true,
            data: dashboardData,
            message: 'Dashboard data retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting student dashboard:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getStudentProgress,
    getTopicProgress,
    updateTopicProgress,
    getStudentDashboard
};