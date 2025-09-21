const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    getContentManagement,
    getCourseContent,
    getCourseModules,
    bulkUpdateCourseModules,
    getCourseModulesWithProgress,
    canAttemptPractice
} = require('../controllers/course');

const router = Router();

/**
 * @route   GET /content-management
 * @desc    Get all content management data
 * @access  Private
 */
router.get('/content-management', [
    fieldsValidates
], getContentManagement);

/**
 * @route   GET /course/:courseId
 * @desc    Get course content by course ID
 * @access  Private
 */
router.get('/course/:courseId', [
    check('courseId', 'Course ID is required').isNumeric(),
    fieldsValidates
], getCourseContent);

/**
 * @route   GET / (Get all course modules with topics)
 * @desc    Get all course modules with their topics
 * @access  Private
 */
router.get('/', [
], getCourseModules);

/**
 * @route   PUT /bulk-update
 * @desc    Bulk update course modules and their topics
 * @access  Private
 */
router.put('/bulk-update', [
    check('courseModules', 'courseModules array is required').isArray(),
    fieldsValidates
], bulkUpdateCourseModules);

/**
 * @route   GET /with-progress (Get all course modules with topics and student progress)
 * @desc    Get all course modules with their topics and student progress
 * @access  Private
 */
router.get('/with-progress', [
], getCourseModulesWithProgress);


module.exports = router;