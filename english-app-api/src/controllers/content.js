const { response } = require("express");
const { pool } = require('../database/db-connection/mySqlDbConnection');
const CourseDto = require('../database/models/courseDto');
const TopicDto = require('../database/models/topicDto');
const LessonDto = require('../database/models/lessonDto');

/**
 * Get course content with topics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getCourseContent = async (req, res = response) => {
    try {
        const { courseId } = req.params;

        // Get course info
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

        // Get topics for course
        const [topicsResult] = await pool.query(
            'SELECT * FROM topics WHERE course_id = ? AND state = 1 ORDER BY topic_index',
            [courseId]
        );

        const course = new CourseDto(courseResult[0]);
        const topics = topicsResult.map(t => new TopicDto(t));

        return res.json({
            ok: true,
            data: {
                course,
                topics
            },
            message: 'Course content retrieved successfully'
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
 * Get topic content with lessons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getTopicContent = async (req, res = response) => {
    try {
        const { topicId } = req.params;

        // Get topic info
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

        // Get lessons for topic
        const [lessonsResult] = await pool.query(
            'SELECT * FROM lessons WHERE topic_id = ? AND state = 1 ORDER BY lesson_index',
            [topicId]
        );

        const topic = new TopicDto(topicResult[0]);
        const lessons = lessonsResult.map(l => new LessonDto(l));

        return res.json({
            ok: true,
            data: {
                topic,
                lessons
            },
            message: 'Topic content retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting topic content:', error);
        return res.status(500).json({
            ok: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

/**
 * Get specific lesson content
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getLessonContent = async (req, res = response) => {
    try {
        const { topicId, lessonIndex } = req.params;

        const query = `
            SELECT l.*, t.title as topic_title, c.level as course_level
            FROM lessons l
            JOIN topics t ON l.topic_id = t.id
            JOIN courses c ON t.course_id = c.id
            WHERE l.topic_id = ? AND l.lesson_index = ? AND l.state = 1
        `;

        const [lessonResult] = await pool.query(query, [topicId, lessonIndex]);

        if (lessonResult.length === 0) {
            return res.status(404).json({
                ok: false,
                data: [],
                message: 'Lesson not found'
            });
        }

        const lesson = new LessonDto(lessonResult[0]);
        lesson.topic_title = lessonResult[0].topic_title;
        lesson.course_level = lessonResult[0].course_level;

        return res.json({
            ok: true,
            data: lesson,
            message: 'Lesson content retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting lesson content:', error);
        return res.status(500).json({
            ok: false,
            data: {},
            message: 'Internal server error'
        });
    }
};

/**
 * Get all courses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getAllCourses = async (req, res = response) => {
    try {
        const [courses] = await pool.query(
            'SELECT * FROM courses WHERE state = 1 ORDER BY level'
        );

        const coursesDto = courses.map(c => new CourseDto(c));

        return res.json({
            ok: true,
            data: coursesDto,
            message: 'Courses retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting courses:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

/**
 * Get topics for a specific course
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response
 */
const getCourseTopics = async (req, res = response) => {
    try {
        const { courseId } = req.params;

        const [topics] = await pool.query(
            'SELECT * FROM topics WHERE course_id = ? AND state = 1 ORDER BY topic_index',
            [courseId]
        );

        const topicsDto = topics.map(t => new TopicDto(t));

        return res.json({
            ok: true,
            data: topicsDto,
            message: 'Topics retrieved successfully'
        });

    } catch (error) {
        console.error('Error getting topics:', error);
        return res.status(500).json({
            ok: false,
            data: [],
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getCourseContent,
    getTopicContent,
    getLessonContent,
    getAllCourses,
    getCourseTopics
};