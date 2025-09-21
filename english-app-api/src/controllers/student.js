const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');

/**
 * Update student progress for a course
 * Actualiza el progreso de un estudiante en un curso (no por topic, porque no existe tabla topics).
 */
const updateCourseProgress = async (req, res = response) => {
    try {
        const { userId, courseId } = req.params;
        const { status, progress_percentage } = req.body;

        // Check if progress record exists
        const [existing] = await pool.query(
            'SELECT id FROM student_progress WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        if (existing.length > 0) {
            // Update existing progress
            await pool.query(`
                UPDATE student_progress 
                SET status = ?, progress_percentage = ?, 
                    started_at = CASE WHEN started_at IS NULL AND status != 'not_started' THEN NOW() ELSE started_at END,
                    completed_at = CASE WHEN status = 'completed' THEN NOW() ELSE completed_at END,
                    last_accessed = NOW(),
                    updated_at = NOW()
                WHERE user_id = ? AND course_id = ?
            `, [status, progress_percentage || 0, userId, courseId]);
        } else {
            // Insert new progress record
            await pool.query(`
                INSERT INTO student_progress (user_id, course_id, status, progress_percentage, started_at)
                VALUES (?, ?, ?, ?, CASE WHEN ? != 'not_started' THEN NOW() ELSE NULL END)
            `, [userId, courseId, status, progress_percentage || 0, status]);
        }

        return res.json({
            ok: true,
            data: [],
            message: 'Progress updated successfully'
        });

    } catch (error) {
        console.error('Error updating course progress:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Get student dashboard data with overview of all courses
 * Devuelve todos los cursos con el progreso del estudiante.
 */
const getStudentDashboard = async (req, res = response) => {
    try {
        const { userId } = req.params;

        const query = `
            SELECT 
                c.id as course_id,
                c.level,
                c.title as course_title,
                c.progress as total_progress,
                sp.status,
                sp.progress_percentage,
                sp.last_accessed,
                sp.started_at,
                sp.completed_at
            FROM courses c
            LEFT JOIN student_progress sp 
                ON c.id = sp.course_id AND sp.user_id = ?
            WHERE c.state = 1
            ORDER BY c.level
        `;

        const [dashboard] = await pool.query(query, [userId]);

        const dashboardData = dashboard.map(item => ({
            course_id: item.course_id,
            level: item.level,
            course_title: item.course_title,
            progress: item.total_progress,
            status: item.status || 'not_started',
            progress_percentage: item.progress_percentage || 0,
            started_at: item.started_at,
            completed_at: item.completed_at,
            last_activity: item.last_accessed
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
    updateCourseProgress,
    getStudentDashboard
};
