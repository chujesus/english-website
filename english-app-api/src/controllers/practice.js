const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');
const PracticeAttemptDto = require('../database/models/practiceAttemptDto');

/**
 * Submit a practice attempt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const submitPracticeAttempt = async (req, res = response) => {
    try {
        const { 
            user_id, 
            topic_id, 
            practice_type, 
            section_index, 
            total_questions, 
            correct_answers, 
            time_spent, 
            answers 
        } = req.body;

        // Calculate score
        const score = total_questions > 0 ? (correct_answers / total_questions) * 100 : 0;

        // Check if practice already exists (enforce one attempt per practice)
        const [existing] = await pool.query(
            'SELECT id FROM practice_attempts WHERE user_id = ? AND topic_id = ? AND practice_type = ? AND section_index = ?',
            [user_id, topic_id, practice_type, section_index]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                ok: false,
                data: [],
                message: 'Practice already completed. Only one attempt allowed per practice.'
            });
        }

        // Insert practice attempt
        const query = `
            INSERT INTO practice_attempts 
            (user_id, topic_id, practice_type, section_index, score, total_questions, correct_answers, time_spent, answers)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(query, [
            user_id, topic_id, practice_type, section_index, 
            score, total_questions, correct_answers, time_spent || 0, 
            answers ? JSON.stringify(answers) : null
        ]);

        // Update topic progress
        await updateTopicProgressAfterPractice(user_id, topic_id);

        return res.json({
            ok: true,
            data: { 
                id: result.insertId, 
                score: Math.round(score * 100) / 100,
                passed: score >= 70 // Minimum passing score
            },
            message: 'Practice submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting practice:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Get practice history for a student and topic
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getPracticeHistory = async (req, res = response) => {
    try {
        const { userId, topicId } = req.params;

        const query = `
            SELECT 
                pa.*,
                t.title as topic_title
            FROM practice_attempts pa
            JOIN topics t ON pa.topic_id = t.id
            WHERE pa.user_id = ? AND pa.topic_id = ? AND pa.state = 1
            ORDER BY pa.practice_type, pa.section_index
        `;

        const [practices] = await pool.query(query, [userId, topicId]);

        const practicesDto = practices.map(p => new PracticeAttemptDto(p));

        return res.json({
            ok: true,
            data: practicesDto,
            message: 'Practice history retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting practice history:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Check if student can attempt a specific practice
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const canAttemptPractice = async (req, res = response) => {
    try {
        const { userId, topicId, practiceType, sectionIndex } = req.params;

        const query = `
            SELECT id FROM practice_attempts 
            WHERE user_id = ? AND topic_id = ? AND practice_type = ? AND section_index = ? AND state = 1
        `;

        const [existing] = await pool.query(query, [userId, topicId, practiceType, sectionIndex]);

        const canAttempt = existing.length === 0;

        return res.json({
            ok: true,
            data: { 
                can_attempt: canAttempt,
                already_completed: !canAttempt 
            },
            message: canAttempt ? 'Practice can be attempted' : 'Practice already completed'
        });

    } catch (error) {
        console.error('Error checking practice attempt:', error);
        return res.status(500).json({
            ok: false,
            data: { can_attempt: false },
            message: 'Internal server error'
        });
    }
};

/**
 * Calculate topic score based on all completed practices
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const calculateTopicScore = async (req, res = response) => {
    try {
        const { userId, topicId } = req.params;

        const query = `
            SELECT 
                AVG(score) as average_score,
                COUNT(*) as total_practices,
                SUM(CASE WHEN score >= 70 THEN 1 ELSE 0 END) as passed_practices
            FROM practice_attempts 
            WHERE user_id = ? AND topic_id = ? AND state = 1
        `;

        const [result] = await pool.query(query, [userId, topicId]);

        const data = result[0];
        const topicScore = {
            average_score: Math.round((data.average_score || 0) * 100) / 100,
            total_practices: data.total_practices || 0,
            passed_practices: data.passed_practices || 0,
            completion_rate: data.total_practices > 0 
                ? Math.round((data.passed_practices / data.total_practices) * 100) 
                : 0
        };

        return res.json({
            ok: true,
            data: topicScore,
            message: 'Topic score calculated successfully'
        });

    } catch (error) {
        console.error('Error calculating topic score:', error);
        return res.status(500).json({
            ok: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

/**
 * Helper function to update topic progress after practice completion
 * @param {number} userId - User ID
 * @param {number} topicId - Topic ID
 */
const updateTopicProgressAfterPractice = async (userId, topicId) => {
    try {
        // Get total practices for topic and completed practices
        const [practiceCount] = await pool.query(`
            SELECT 
                COUNT(*) as completed_practices,
                AVG(score) as avg_score
            FROM practice_attempts 
            WHERE user_id = ? AND topic_id = ? AND state = 1
        `, [userId, topicId]);

        // Get expected total practices from lesson content (this is a simplified calculation)
        // In reality, you'd need to count sections in the lesson JSON
        const expectedPractices = 15; // Average practices per topic (listening + speaking + fill-in-blank)
        
        const completed = practiceCount[0].completed_practices || 0;
        const avgScore = practiceCount[0].avg_score || 0;
        const progressPercentage = Math.min((completed / expectedPractices) * 100, 100);
        
        // Determine status
        let status = 'not_started';
        if (completed > 0 && progressPercentage < 100) {
            status = 'in_progress';
        } else if (progressPercentage >= 100 && avgScore >= 70) {
            status = 'completed';
        }

        // Update or insert progress
        await pool.query(`
            INSERT INTO student_progress (user_id, topic_id, course_id, status, progress_percentage, started_at, completed_at)
            SELECT ?, ?, t.course_id, ?, ?, 
                   CASE WHEN ? > 0 THEN NOW() ELSE NULL END,
                   CASE WHEN ? = 'completed' THEN NOW() ELSE NULL END
            FROM topics t WHERE t.id = ?
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                progress_percentage = VALUES(progress_percentage),
                started_at = CASE WHEN started_at IS NULL THEN VALUES(started_at) ELSE started_at END,
                completed_at = VALUES(completed_at),
                last_accessed = NOW()
        `, [userId, topicId, status, progressPercentage, completed, status, topicId]);

    } catch (error) {
        console.error('Error updating topic progress:', error);
    }
};

module.exports = {
    submitPracticeAttempt,
    getPracticeHistory,
    canAttemptPractice,
    calculateTopicScore
};