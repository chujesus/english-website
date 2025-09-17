const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    uploadCourseContent, 
    updateTopicContent, 
    uploadLessonContent, 
    getContentManagement, 
    validateJSONStructure 
} = require('../controllers/admin');

const router = Router();

/**
 * @route   GET /admin/content-management
 * @desc    Get content management overview
 * @access  Private (Admin only)
 */
router.get('/content-management', [
    fieldsValidates
], getContentManagement);

/**
 * @route   POST /admin/upload/course
 * @desc    Upload complete course content
 * @access  Private (Admin only)
 */
router.post('/upload/course', [
    check('courseId', 'Course ID is required').isNumeric(),
    check('topics', 'Topics array is required').isArray(),
    check('lessons', 'Lessons array is required').isArray(),
    fieldsValidates
], uploadCourseContent);

/**
 * @route   PUT /admin/topic/:topicId
 * @desc    Update specific topic content
 * @access  Private (Admin only)
 */
router.put('/topic/:topicId', [
    check('topicId', 'Topic ID is required').isNumeric(),
    check('title', 'Title is required').notEmpty(),
    check('objective', 'Objective is required').notEmpty(),
    fieldsValidates
], updateTopicContent);

/**
 * @route   POST /admin/upload/lesson/:topicId
 * @desc    Upload/update lesson content for a topic
 * @access  Private (Admin only)
 */
router.post('/upload/lesson/:topicId', [
    check('topicId', 'Topic ID is required').isNumeric(),
    check('lesson_index', 'Lesson index is required').isNumeric(),
    check('content', 'Content is required').notEmpty(),
    fieldsValidates
], uploadLessonContent);

/**
 * @route   POST /admin/validate-json
 * @desc    Validate JSON structure for course content
 * @access  Private (Admin only)
 */
router.post('/validate-json', [
    check('jsonData', 'JSON data is required').notEmpty(),
    check('type', 'Type is required').isIn(['topic', 'lesson']),
    fieldsValidates
], validateJSONStructure);

module.exports = router;