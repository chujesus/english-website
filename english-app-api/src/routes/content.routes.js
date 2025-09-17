const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    getCourseContent, 
    getTopicContent, 
    getLessonContent, 
    getAllCourses, 
    getCourseTopics 
} = require('../controllers/content');

const router = Router();

/**
 * @route   GET /content/courses
 * @desc    Get all courses
 * @access  Private
 */
router.get('/courses', [
    fieldsValidates
], getAllCourses);

/**
 * @route   GET /content/course/:courseId
 * @desc    Get course content with topics
 * @access  Private
 */
router.get('/course/:courseId', [
    check('courseId', 'Course ID is required').isNumeric(),
    fieldsValidates
], getCourseContent);

/**
 * @route   GET /content/course/:courseId/topics
 * @desc    Get topics for a specific course
 * @access  Private
 */
router.get('/course/:courseId/topics', [
    check('courseId', 'Course ID is required').isNumeric(),
    fieldsValidates
], getCourseTopics);

/**
 * @route   GET /content/topic/:topicId
 * @desc    Get topic content with lessons
 * @access  Private
 */
router.get('/topic/:topicId', [
    check('topicId', 'Topic ID is required').isNumeric(),
    fieldsValidates
], getTopicContent);

/**
 * @route   GET /content/lesson/:topicId/:lessonIndex
 * @desc    Get specific lesson content
 * @access  Private
 */
router.get('/lesson/:topicId/:lessonIndex', [
    check('topicId', 'Topic ID is required').isNumeric(),
    check('lessonIndex', 'Lesson index is required').isNumeric(),
    fieldsValidates
], getLessonContent);

module.exports = router;