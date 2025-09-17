const { Router } = require('express');
const { check } = require('express-validator');
const { fieldsValidates } = require('../middlewares/fields-validates');
const { 
    getStudentProgress, 
    getTopicProgress, 
    updateTopicProgress, 
    getStudentDashboard 
} = require('../controllers/progress');

const router = Router();

/**
 * @route   GET /progress/student/:userId?courseId=:courseId
 * @desc    Get student progress for all courses or specific course
 * @access  Private
 * @query   courseId (optional) - Filter by specific course ID
 */
router.get('/student/:userId', [
    check('userId', 'User ID is required').isNumeric(),
    fieldsValidates
], getStudentProgress);

/**
 * @route   GET /progress/student/:userId/topic/:topicId
 * @desc    Get topic-specific progress for a student
 * @access  Private
 */
router.get('/student/:userId/topic/:topicId', [
    check('userId', 'User ID is required').isNumeric(),
    check('topicId', 'Topic ID is required').isNumeric(),
    fieldsValidates
], getTopicProgress);

/**
 * @route   PUT /progress/student/:userId/topic/:topicId
 * @desc    Update topic progress status
 * @access  Private
 */
router.put('/student/:userId/topic/:topicId', [
    check('userId', 'User ID is required').isNumeric(),
    check('topicId', 'Topic ID is required').isNumeric(),
    check('status', 'Status is required').isIn(['not_started', 'in_progress', 'completed']),
    fieldsValidates
], updateTopicProgress);

/**
 * @route   GET /progress/dashboard/:userId
 * @desc    Get student dashboard data with overview of all courses
 * @access  Private
 */
router.get('/dashboard/:userId', [
    check('userId', 'User ID is required').isNumeric(),
    fieldsValidates
], getStudentDashboard);

module.exports = router;